import UIKit
import WebKit

class ViewController: UIViewController, WKNavigationDelegate, WKUIDelegate, WKScriptMessageHandler {

    var webView: WKWebView!

    // Haptic generators — pre-instantiated for responsiveness
    private let impactLight = UIImpactFeedbackGenerator(style: .light)
    private let impactMedium = UIImpactFeedbackGenerator(style: .medium)
    private let impactHeavy = UIImpactFeedbackGenerator(style: .heavy)
    private let notificationFeedback = UINotificationFeedbackGenerator()
    private let selectionFeedback = UISelectionFeedbackGenerator()

    override func viewDidLoad() {
        super.viewDidLoad()

        // --- WKWebView configuration ---
        let config = WKWebViewConfiguration()

        // Allow localStorage to persist between launches
        config.websiteDataStore = WKWebsiteDataStore.default()

        // Allow file-access so the HTML can read itself from the bundle
        let prefs = WKWebpagePreferences()
        prefs.allowsContentJavaScript = true
        config.defaultWebpagePreferences = prefs

        // Register JS → native haptic message handler
        config.userContentController.add(self, name: "haptic")

        // Pre-warm haptic generators
        impactLight.prepare()
        impactMedium.prepare()
        impactHeavy.prepare()

        // --- Create and fill the view ---
        webView = WKWebView(frame: .zero, configuration: config)
        webView.navigationDelegate = self
        webView.uiDelegate = self
        webView.translatesAutoresizingMaskIntoConstraints = false

        // Prevent rubber-band scroll so the app feels native
        webView.scrollView.bounces = false
        webView.scrollView.showsVerticalScrollIndicator = false

        view.addSubview(webView)
        NSLayoutConstraint.activate([
            webView.topAnchor.constraint(equalTo: view.topAnchor),
            webView.bottomAnchor.constraint(equalTo: view.bottomAnchor),
            webView.leadingAnchor.constraint(equalTo: view.leadingAnchor),
            webView.trailingAnchor.constraint(equalTo: view.trailingAnchor)
        ])

        // --- Load the bundled HTML file ---
        guard let htmlPath = Bundle.main.url(forResource: "index", withExtension: "html") else {
            showLoadError()
            return
        }

        // allowingReadAccessTo must be the directory, not the file itself
        let bundleDir = htmlPath.deletingLastPathComponent()
        webView.loadFileURL(htmlPath, allowingReadAccessTo: bundleDir)
    }

    // Keep the status bar readable over the app
    override var preferredStatusBarStyle: UIStatusBarStyle {
        return .darkContent
    }

    // Lock to portrait — makes field use easier
    override var supportedInterfaceOrientations: UIInterfaceOrientationMask {
        return [.portrait, .portraitUpsideDown]
    }

    // MARK: - WKNavigationDelegate

    func webView(_ webView: WKWebView,
                 decidePolicyFor navigationAction: WKNavigationAction,
                 decisionHandler: @escaping (WKNavigationActionPolicy) -> Void) {

        // Allow local file navigation; open any external http/https link in Safari
        if let url = navigationAction.request.url {
            if url.isFileURL {
                decisionHandler(.allow)
            } else if url.scheme == "mailto" {
                // Let the mail compose handler open
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

    // MARK: - WKUIDelegate (handles window.alert / confirm / prompt from JS)

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

    // MARK: - WKScriptMessageHandler (haptic feedback from JS)

    func userContentController(_ userContentController: WKUserContentController,
                                didReceive message: WKScriptMessage) {
        guard message.name == "haptic", let type = message.body as? String else { return }
        switch type {
        case "light":
            impactLight.impactOccurred()
            impactLight.prepare()
        case "medium":
            impactMedium.impactOccurred()
            impactMedium.prepare()
        case "heavy":
            impactHeavy.impactOccurred()
            impactHeavy.prepare()
        case "success":
            notificationFeedback.notificationOccurred(.success)
        case "warning":
            notificationFeedback.notificationOccurred(.warning)
        case "error":
            notificationFeedback.notificationOccurred(.error)
        case "selection":
            selectionFeedback.selectionChanged()
            selectionFeedback.prepare()
        default:
            impactMedium.impactOccurred()
            impactMedium.prepare()
        }
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
            label.trailingAnchor.constraint(equalTo: view.trailingAnchor, constant: -32)
        ])
    }
}
