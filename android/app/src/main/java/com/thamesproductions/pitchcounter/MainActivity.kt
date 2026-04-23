package com.thamesproductions.pitchcounter

import android.content.Context
import android.content.Intent
import android.net.Uri
import android.os.Build
import android.os.Bundle
import android.os.VibrationEffect
import android.os.Vibrator
import android.os.VibratorManager
import android.util.Base64
import android.view.KeyEvent
import android.view.View
import android.view.WindowInsetsController
import android.webkit.JavascriptInterface
import android.webkit.JsPromptResult
import android.webkit.JsResult
import android.webkit.ValueCallback
import android.webkit.WebChromeClient
import android.webkit.WebResourceRequest
import android.webkit.WebSettings
import android.webkit.WebView
import android.webkit.WebViewClient
import android.widget.EditText
import androidx.appcompat.app.AlertDialog
import androidx.appcompat.app.AppCompatActivity
import androidx.core.content.FileProvider
import com.google.android.play.core.review.ReviewManagerFactory
import java.io.File
import java.io.FileOutputStream

class MainActivity : AppCompatActivity() {

    private lateinit var webView: WebView
    private lateinit var vibrator: Vibrator

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        window.statusBarColor = 0xFFF2F2F7.toInt()
        window.navigationBarColor = 0xFFF2F2F7.toInt()

        vibrator = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
            val mgr = getSystemService(Context.VIBRATOR_MANAGER_SERVICE) as VibratorManager
            mgr.defaultVibrator
        } else {
            @Suppress("DEPRECATION")
            getSystemService(Context.VIBRATOR_SERVICE) as Vibrator
        }

        WebView.setWebContentsDebuggingEnabled(true)

        webView = WebView(this).apply {
            settings.javaScriptEnabled = true
            settings.domStorageEnabled = true
            settings.mediaPlaybackRequiresUserGesture = false
            settings.mixedContentMode = WebSettings.MIXED_CONTENT_NEVER_ALLOW
            settings.cacheMode = WebSettings.LOAD_DEFAULT
            overScrollMode = View.OVER_SCROLL_NEVER
            isVerticalScrollBarEnabled = false
        }

        webView.addJavascriptInterface(WebAppInterface(), "Android")

        webView.webViewClient = object : WebViewClient() {
            override fun shouldOverrideUrlLoading(view: WebView, request: WebResourceRequest): Boolean {
                val url = request.url
                return when (url.scheme) {
                    "http", "https", "mailto" -> {
                        startActivity(Intent(Intent.ACTION_VIEW, url))
                        true
                    }
                    else -> false
                }
            }

            override fun onPageFinished(view: WebView, url: String) {
                super.onPageFinished(view, url)
                val density = resources.displayMetrics.density
                val statusBarCss = getStatusBarHeight() / density
                val navBarCss = getNavBarHeight() / density
                view.evaluateJavascript(
                    "document.documentElement.style.setProperty('--android-status-bar','${statusBarCss}px');" +
                    "document.documentElement.style.setProperty('--top-inset','${statusBarCss}px');" +
                    "document.documentElement.style.setProperty('--android-nav-bar','${navBarCss}px');" +
                    "document.documentElement.style.setProperty('--bottom-inset','${navBarCss}px');" +
                    "document.documentElement.style.setProperty('--header-pad','8px')",
                    null
                )
            }
        }

        webView.webChromeClient = object : WebChromeClient() {
            override fun onJsAlert(view: WebView, url: String, message: String, result: JsResult): Boolean {
                AlertDialog.Builder(this@MainActivity)
                    .setMessage(message)
                    .setPositiveButton("OK") { _, _ -> result.confirm() }
                    .setOnCancelListener { result.cancel() }
                    .show()
                return true
            }

            override fun onJsConfirm(view: WebView, url: String, message: String, result: JsResult): Boolean {
                AlertDialog.Builder(this@MainActivity)
                    .setMessage(message)
                    .setPositiveButton("OK") { _, _ -> result.confirm() }
                    .setNegativeButton("Cancel") { _, _ -> result.cancel() }
                    .setOnCancelListener { result.cancel() }
                    .show()
                return true
            }

            override fun onJsPrompt(view: WebView, url: String, message: String, defaultValue: String?, result: JsPromptResult): Boolean {
                val input = EditText(this@MainActivity).apply {
                    setText(defaultValue)
                }
                AlertDialog.Builder(this@MainActivity)
                    .setMessage(message)
                    .setView(input)
                    .setPositiveButton("OK") { _, _ -> result.confirm(input.text.toString()) }
                    .setNegativeButton("Cancel") { _, _ -> result.cancel() }
                    .setOnCancelListener { result.cancel() }
                    .show()
                return true
            }
        }

        setContentView(webView)
        webView.loadUrl("file:///android_asset/index.html")

        onBackPressedDispatcher.addCallback(this, object : androidx.activity.OnBackPressedCallback(true) {
            override fun handleOnBackPressed() {
                webView.evaluateJavascript(
                    "(function() { if (window.onAndroidBack) return window.onAndroidBack(); return false; })()"
                ) { result ->
                    if (result == "false" || result == "null") {
                        isEnabled = false
                        onBackPressedDispatcher.onBackPressed()
                        isEnabled = true
                    }
                }
            }
        })
    }

    override fun dispatchKeyEvent(event: KeyEvent): Boolean {
        if (event.action == KeyEvent.ACTION_DOWN) {
            when (event.keyCode) {
                KeyEvent.KEYCODE_VOLUME_UP -> {
                    webView.evaluateJavascript("window.onPhysicalButton && window.onPhysicalButton('volUp')", null)
                    triggerHaptic("medium")
                    return true
                }
                KeyEvent.KEYCODE_VOLUME_DOWN -> {
                    webView.evaluateJavascript("window.onPhysicalButton && window.onPhysicalButton('volDown')", null)
                    triggerHaptic("medium")
                    return true
                }
            }
        } else if (event.action == KeyEvent.ACTION_UP) {
            if (event.keyCode == KeyEvent.KEYCODE_VOLUME_UP || event.keyCode == KeyEvent.KEYCODE_VOLUME_DOWN) {
                return true
            }
        }
        return super.dispatchKeyEvent(event)
    }

    private fun triggerHaptic(type: String) {
        val effect = when (type) {
            "light" -> VibrationEffect.createOneShot(20, 40)
            "medium" -> VibrationEffect.createOneShot(30, 120)
            "heavy" -> VibrationEffect.createOneShot(50, 200)
            "success" -> VibrationEffect.createWaveform(longArrayOf(0, 30, 60, 30), intArrayOf(0, 120, 0, 180), -1)
            "warning" -> VibrationEffect.createWaveform(longArrayOf(0, 40, 40, 40), intArrayOf(0, 160, 0, 160), -1)
            "error" -> VibrationEffect.createWaveform(longArrayOf(0, 50, 30, 50, 30, 50), intArrayOf(0, 200, 0, 200, 0, 200), -1)
            "selection" -> VibrationEffect.createOneShot(10, 30)
            else -> VibrationEffect.createOneShot(30, 120)
        }
        vibrator.vibrate(effect)
    }

    private fun updateStatusBar(isDark: Boolean) {
        if (isDark) {
            window.statusBarColor = 0xFF0B1C3A.toInt()
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {
                window.decorView.windowInsetsController?.setSystemBarsAppearance(
                    0, WindowInsetsController.APPEARANCE_LIGHT_STATUS_BARS
                )
            } else {
                @Suppress("DEPRECATION")
                window.decorView.systemUiVisibility =
                    window.decorView.systemUiVisibility and View.SYSTEM_UI_FLAG_LIGHT_STATUS_BAR.inv()
            }
        } else {
            window.statusBarColor = 0xFFF2F2F7.toInt()
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {
                window.decorView.windowInsetsController?.setSystemBarsAppearance(
                    WindowInsetsController.APPEARANCE_LIGHT_STATUS_BARS,
                    WindowInsetsController.APPEARANCE_LIGHT_STATUS_BARS
                )
            } else {
                @Suppress("DEPRECATION")
                window.decorView.systemUiVisibility =
                    window.decorView.systemUiVisibility or View.SYSTEM_UI_FLAG_LIGHT_STATUS_BAR
            }
        }
    }

    private fun shareImage(base64Data: String) {
        try {
            val cleaned = base64Data.removePrefix("data:image/png;base64,")
            val bytes = Base64.decode(cleaned, Base64.DEFAULT)

            val dir = File(cacheDir, "shared_images")
            dir.mkdirs()
            val file = File(dir, "pitch_stats_${System.currentTimeMillis()}.png")
            FileOutputStream(file).use { it.write(bytes) }

            val uri = FileProvider.getUriForFile(this, "${packageName}.fileprovider", file)
            val intent = Intent(Intent.ACTION_SEND).apply {
                type = "image/png"
                putExtra(Intent.EXTRA_STREAM, uri)
                addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION)
            }
            startActivity(Intent.createChooser(intent, null))
        } catch (e: Exception) {
            android.util.Log.e("SimplePitchCounter", "Share failed", e)
        }
    }

    private fun getStatusBarHeight(): Int {
        val resId = resources.getIdentifier("status_bar_height", "dimen", "android")
        return if (resId > 0) resources.getDimensionPixelSize(resId) else 0
    }

    private fun getNavBarHeight(): Int {
        val resId = resources.getIdentifier("navigation_bar_height", "dimen", "android")
        return if (resId > 0) resources.getDimensionPixelSize(resId) else 0
    }

    inner class WebAppInterface {
        @JavascriptInterface
        fun haptic(type: String) {
            runOnUiThread { triggerHaptic(type) }
        }

        @JavascriptInterface
        fun screenChange(screen: String) {
            runOnUiThread { updateStatusBar(screen == "game") }
        }

        @JavascriptInterface
        fun shareImage(base64Data: String) {
            runOnUiThread { this@MainActivity.shareImage(base64Data) }
        }

        @JavascriptInterface
        fun requestReview() {
            runOnUiThread { this@MainActivity.launchInAppReview() }
        }
    }

    private fun launchInAppReview() {
        val manager = ReviewManagerFactory.create(this)
        manager.requestReviewFlow().addOnCompleteListener { task ->
            if (task.isSuccessful) {
                manager.launchReviewFlow(this, task.result)
            }
        }
    }
}
