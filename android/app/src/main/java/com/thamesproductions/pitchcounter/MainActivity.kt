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
import android.graphics.Color
import android.view.KeyEvent
import android.view.View
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
import android.widget.FrameLayout
import androidx.activity.SystemBarStyle
import androidx.activity.enableEdgeToEdge
import androidx.appcompat.app.AlertDialog
import androidx.appcompat.app.AppCompatActivity
import androidx.core.content.FileProvider
import androidx.core.view.ViewCompat
import androidx.core.view.WindowCompat
import androidx.core.view.WindowInsetsCompat
import com.google.android.play.core.review.ReviewManagerFactory
import java.io.File
import java.io.FileOutputStream

class MainActivity : AppCompatActivity() {

    private lateinit var webView: WebView
    private lateinit var vibrator: Vibrator

    // System bar heights in CSS px, pushed to the page as --top-inset / --bottom-inset
    private var topInsetCss = 0f
    private var bottomInsetCss = 0f

    override fun onCreate(savedInstanceState: Bundle?) {
        // Android 15+ enforces edge-to-edge for apps targeting 35+, and Android 16 removes the
        // opt-out. Draw edge-to-edge on every version so the page's inset padding means the same
        // thing everywhere; bar colors are ignored on 35+, so the page paints behind the bars.
        enableEdgeToEdge(
            statusBarStyle = SystemBarStyle.light(Color.TRANSPARENT, Color.TRANSPARENT),
            navigationBarStyle = SystemBarStyle.light(0xE6F2F2F7.toInt(), 0xE6F2F2F7.toInt())
        )
        super.onCreate(savedInstanceState)

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
                pushInsetsToPage()
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

        // The container absorbs the keyboard and side insets; adjustResize no longer resizes an
        // edge-to-edge window, so the keyboard would otherwise cover the inputs.
        val container = FrameLayout(this)
        container.addView(webView, FrameLayout.LayoutParams(
            FrameLayout.LayoutParams.MATCH_PARENT, FrameLayout.LayoutParams.MATCH_PARENT))
        ViewCompat.setOnApplyWindowInsetsListener(container) { v, insets ->
            val bars = insets.getInsets(
                WindowInsetsCompat.Type.systemBars() or WindowInsetsCompat.Type.displayCutout())
            val ime = insets.getInsets(WindowInsetsCompat.Type.ime())
            v.setPadding(bars.left, 0, bars.right, maxOf(ime.bottom - bars.bottom, 0))
            val density = resources.displayMetrics.density
            topInsetCss = bars.top / density
            bottomInsetCss = bars.bottom / density
            pushInsetsToPage()
            WindowInsetsCompat.CONSUMED
        }
        setContentView(container)
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
        // The page paints behind the status bar, so only the icon color needs to follow it
        WindowCompat.getInsetsController(window, window.decorView)
            .isAppearanceLightStatusBars = !isDark
    }

    private fun pushInsetsToPage() {
        if (!::webView.isInitialized) return
        webView.evaluateJavascript(
            "document.documentElement.style.setProperty('--android-status-bar','${topInsetCss}px');" +
            "document.documentElement.style.setProperty('--top-inset','${topInsetCss}px');" +
            "document.documentElement.style.setProperty('--android-nav-bar','${bottomInsetCss}px');" +
            "document.documentElement.style.setProperty('--bottom-inset','${bottomInsetCss}px');" +
            "document.documentElement.style.setProperty('--header-pad','8px')",
            null
        )
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
