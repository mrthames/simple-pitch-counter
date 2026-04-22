import UIKit
import WebKit
import AVFoundation
import MediaPlayer

class ViewController: UIViewController, WKNavigationDelegate, WKUIDelegate, WKScriptMessageHandler {

    var webView: WKWebView!

    // Haptic generators
    private let impactLight   = UIImpactFeedbackGenerator(style: .light)
    private let impactMedium  = UIImpactFeedbackGenerator(style: .medium)
    private let impactHeavy   = UIImpactFeedbackGenerator(style: .heavy)
    private let notificationFeedback = UINotificationFeedbackGenerator()
    private let selectionFeedback    = UISelectionFeedbackGenerator()

    // Volume button tracking
    private var prevVolume: Float = 0.5
    private var volumeKVOActive = false
    // Debounce: ignore rapid repeat presses within 0.25s
    private var lastVolumeFire: TimeInterval = 0
    private let volumeDebounce: TimeInterval = 0.25

    override func viewDidLoad() {
        super.viewDidLoad()

        view.backgroundColor = UIColor(red: 0.949, green: 0.949, blue: 0.969, alpha: 1.0) // #F2F2F7

        // ── WebView configuration ──────────────────────────────
        let config = WKWebViewConfiguration()
        config.websiteDataStore = WKWebsiteDataStore.default()
        let prefs = WKWebpagePreferences()
        prefs.allowsContentJavaScript = true
        config.defaultWebpagePreferences = prefs
        config.userContentController.add(self, name: "haptic")
        config.userContentController.add(self, name: "screenChange")
        config.userContentController.add(self, name: "shareImage")

        impactLight.prepare()
        impactMedium.prepare()
        impactHeavy.prepare()

        webView = WKWebView(frame: .zero, configuration: config)
        webView.navigationDelegate = self
        webView.uiDelegate = self
        webView.translatesAutoresizingMaskIntoConstraints = false
        webView.scrollView.bounces = false
        webView.scrollView.showsVerticalScrollIndicator = false
        #if DEBUG
        if #available(iOS 16.4, *) { webView.isInspectable = true }
        #endif

        view.addSubview(webView)
        NSLayoutConstraint.activate([
            webView.topAnchor.constraint(equalTo: view.safeAreaLayoutGuide.topAnchor),
            webView.bottomAnchor.constraint(equalTo: view.bottomAnchor),
            webView.leadingAnchor.constraint(equalTo: view.leadingAnchor),
            webView.trailingAnchor.constraint(equalTo: view.trailingAnchor),
        ])

        guard let htmlPath = Bundle.main.url(forResource: "index", withExtension: "html") else {
            showLoadError(); return
        }
        webView.loadFileURL(htmlPath, allowingReadAccessTo: htmlPath.deletingLastPathComponent())

        // ── Volume button setup ────────────────────────────────
        setupVolumeButtonCapture()
    }

    // MARK: - Volume Button Capture

    private func setupVolumeButtonCapture() {
        // Activate audio session so we can observe outputVolume
        let session = AVAudioSession.sharedInstance()
        do {
            try session.setActive(true)
        } catch {
            print("AVAudioSession activate error: \(error)")
        }
        prevVolume = session.outputVolume
        session.addObserver(self,
                            forKeyPath: "outputVolume",
                            options: [.new, .old],
                            context: nil)
        volumeKVOActive = true

        // Add an invisible MPVolumeView — this suppresses the system volume HUD
        // so the volume overlay doesn't appear when the user presses the buttons.
        let volumeView = MPVolumeView(frame: CGRect(x: -100, y: -100, width: 1, height: 1))
        volumeView.alpha = 0.001
        volumeView.isUserInteractionEnabled = false
        view.addSubview(volumeView)
    }

    override func observeValue(forKeyPath keyPath: String?,
                               of object: Any?,
                               change: [NSKeyValueChangeKey : Any]?,
                               context: UnsafeMutableRawPointer?) {
        guard keyPath == "outputVolume" else {
            super.observeValue(forKeyPath: keyPath, of: object, change: change, context: context)
            return
        }

        let newVol = AVAudioSession.sharedInstance().outputVolume
        let now = Date().timeIntervalSinceReferenceDate

        // Debounce: skip if fired too recently
        guard now - lastVolumeFire >= volumeDebounce else { return }

        if newVol > prevVolume {
            lastVolumeFire = now
            firePhysicalButton("volUp")
        } else if newVol < prevVolume {
            lastVolumeFire = now
            firePhysicalButton("volDown")
        }
        prevVolume = newVol

        // Reset volume toward center (0.5) so there's room for future presses
        // without hitting the system min/max.
        DispatchQueue.main.asyncAfter(deadline: .now() + 0.05) {
            let slider = MPVolumeView.volumeSlider()
            slider?.value = 0.5
            self.prevVolume = 0.5
        }
    }

    private func firePhysicalButton(_ type: String) {
        // Call window.onPhysicalButton(type) in the JS layer
        let js = "window.onPhysicalButton && window.onPhysicalButton('\(type)')"
        DispatchQueue.main.async {
            self.webView.evaluateJavaScript(js, completionHandler: nil)
        }
        // Provide haptic feedback for the button press
        impactMedium.impactOccurred()
        impactMedium.prepare()
    }

    deinit {
        if volumeKVOActive {
            AVAudioSession.sharedInstance().removeObserver(self, forKeyPath: "outputVolume")
        }
    }

    // MARK: - Status bar / orientation

    private var currentStatusBarStyle: UIStatusBarStyle = .darkContent
    override var preferredStatusBarStyle: UIStatusBarStyle { currentStatusBarStyle }
    override var supportedInterfaceOrientations: UIInterfaceOrientationMask { [.portrait, .portraitUpsideDown] }

    // MARK: - WKNavigationDelegate

    func webView(_ webView: WKWebView,
                 decidePolicyFor navigationAction: WKNavigationAction,
                 decisionHandler: @escaping (WKNavigationActionPolicy) -> Void) {
        if let url = navigationAction.request.url {
            if url.isFileURL {
                decisionHandler(.allow)
            } else if url.scheme == "mailto" {
                UIApplication.shared.open(url)
                decisionHandler(.cancel)
            } else if url.scheme == "http" || url.scheme == "https" {
                UIApplication.shared.open(url)
                decisionHandler(.cancel)
            } else {
                decisionHandler(.allow)
            }
        } else {
            decisionHandler(.allow)
        }
    }

    func webView(_ webView: WKWebView, didFail navigation: WKNavigation!, withError error: Error) {
        showLoadError()
    }

    // MARK: - WKUIDelegate (alert / confirm / prompt)

    func webView(_ webView: WKWebView,
                 runJavaScriptAlertPanelWithMessage message: String,
                 initiatedByFrame frame: WKFrameInfo,
                 completionHandler: @escaping () -> Void) {
        let alert = UIAlertController(title: nil, message: message, preferredStyle: .alert)
        alert.addAction(UIAlertAction(title: "OK", style: .default) { _ in completionHandler() })
        present(alert, animated: true)
    }

    func webView(_ webView: WKWebView,
                 runJavaScriptConfirmPanelWithMessage message: String,
                 initiatedByFrame frame: WKFrameInfo,
                 completionHandler: @escaping (Bool) -> Void) {
        let alert = UIAlertController(title: nil, message: message, preferredStyle: .alert)
        alert.addAction(UIAlertAction(title: "Cancel", style: .cancel) { _ in completionHandler(false) })
        alert.addAction(UIAlertAction(title: "OK", style: .default) { _ in completionHandler(true) })
        present(alert, animated: true)
    }

    func webView(_ webView: WKWebView,
                 runJavaScriptTextInputPanelWithPrompt prompt: String,
                 defaultText: String?,
                 initiatedByFrame frame: WKFrameInfo,
                 completionHandler: @escaping (String?) -> Void) {
        let alert = UIAlertController(title: nil, message: prompt, preferredStyle: .alert)
        alert.addTextField { tf in tf.text = defaultText }
        alert.addAction(UIAlertAction(title: "Cancel", style: .cancel) { _ in completionHandler(nil) })
        alert.addAction(UIAlertAction(title: "OK", style: .default) { _ in
            completionHandler(alert.textFields?.first?.text)
        })
        present(alert, animated: true)
    }

    // MARK: - WKScriptMessageHandler (haptic from JS)

    func userContentController(_ userContentController: WKUserContentController,
                                didReceive message: WKScriptMessage) {
        if message.name == "shareImage", let base64 = message.body as? String {
            shareImageFromBase64(base64)
            return
        }
        if message.name == "screenChange", let screen = message.body as? String {
            let isDark = (screen == "game")
            currentStatusBarStyle = isDark ? .lightContent : .darkContent
            setNeedsStatusBarAppearanceUpdate()
            UIView.animate(withDuration: 0.2) {
                self.view.backgroundColor = isDark
                    ? UIColor(red: 0.043, green: 0.110, blue: 0.227, alpha: 1.0) // #0b1c3a
                    : UIColor(red: 0.949, green: 0.949, blue: 0.969, alpha: 1.0) // #F2F2F7
            }
            return
        }
        guard message.name == "haptic", let type = message.body as? String else { return }
        switch type {
        case "light":   impactLight.impactOccurred();   impactLight.prepare()
        case "medium":  impactMedium.impactOccurred();  impactMedium.prepare()
        case "heavy":   impactHeavy.impactOccurred();   impactHeavy.prepare()
        case "success": notificationFeedback.notificationOccurred(.success)
        case "warning": notificationFeedback.notificationOccurred(.warning)
        case "error":   notificationFeedback.notificationOccurred(.error)
        case "selection": selectionFeedback.selectionChanged(); selectionFeedback.prepare()
        default:        impactMedium.impactOccurred();  impactMedium.prepare()
        }
    }

    // MARK: - Share image via native share sheet

    private func shareImageFromBase64(_ base64: String) {
        let cleaned = base64.replacingOccurrences(of: "data:image/png;base64,", with: "")
        guard let data = Data(base64Encoded: cleaned),
              let image = UIImage(data: data) else { return }
        let ac = UIActivityViewController(activityItems: [image], applicationActivities: nil)
        ac.popoverPresentationController?.sourceView = view
        ac.popoverPresentationController?.sourceRect = CGRect(x: view.bounds.midX, y: view.bounds.midY, width: 0, height: 0)
        present(ac, animated: true)
    }

    // MARK: - Error fallback

    private func showLoadError() {
        let label = UILabel()
        label.text = "Failed to load app.\nMake sure index.html is in the bundle."
        label.numberOfLines = 0
        label.textAlignment = .center
        label.textColor = .secondaryLabel
        label.translatesAutoresizingMaskIntoConstraints = false
        view.addSubview(label)
        NSLayoutConstraint.activate([
            label.centerXAnchor.constraint(equalTo: view.centerXAnchor),
            label.centerYAnchor.constraint(equalTo: view.centerYAnchor),
            label.leadingAnchor.constraint(equalTo: view.leadingAnchor, constant: 32),
            label.trailingAnchor.constraint(equalTo: view.trailingAnchor, constant: -32),
        ])
    }
}

// MARK: - MPVolumeView helper (access hidden slider)

private extension MPVolumeView {
    static func volumeSlider() -> UISlider? {
        let v = MPVolumeView(frame: .zero)
        return v.subviews.first(where: { $0 is UISlider }) as? UISlider
    }
}
