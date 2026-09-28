package com.xcodechess.app;

import android.annotation.SuppressLint;
import android.app.Activity;
import android.graphics.Color;
import android.os.Build;
import android.os.Bundle;
import android.view.View;
import android.view.Window;
import android.view.WindowManager;
import android.webkit.WebChromeClient;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;

/**
 * XCodeChess - Android Application
 * Signed & Developed by: XCODE-Vedant Nimkar
 * High-End Native Experience for Android 14, 15, 16 (Samsung Galaxy S26 Ultra)
 */
public class MainActivity extends Activity {

    private WebView mWebView;

    @Override
    @SuppressLint("SetJavaScriptEnabled")
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        // Modern Edge-to-Edge OLED Bar Styling
        Window window = getWindow();
        window.clearFlags(WindowManager.LayoutParams.FLAG_TRANSLUCENT_STATUS);
        window.addFlags(WindowManager.LayoutParams.FLAG_DRAWS_SYSTEM_BAR_BACKGROUNDS);
        
        // Deep obsidian theme matching app OLED dark background
        int oledBlack = Color.parseColor("#121110");
        window.setStatusBarColor(oledBlack);
        window.setNavigationBarColor(oledBlack);

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.P) {
            window.getAttributes().layoutInDisplayCutoutMode = 
                WindowManager.LayoutParams.LAYOUT_IN_DISPLAY_CUTOUT_MODE_SHORT_EDGES;
        }

        mWebView = new WebView(this);
        mWebView.setFitsSystemWindows(true);
        mWebView.setBackgroundColor(oledBlack);
        mWebView.setOverScrollMode(View.OVER_SCROLL_NEVER);
        mWebView.setVerticalScrollBarEnabled(false);
        mWebView.setHorizontalScrollBarEnabled(false);
        setContentView(mWebView);

        WebSettings settings = mWebView.getSettings();
        settings.setJavaScriptEnabled(true);
        settings.setDomStorageEnabled(true);
        settings.setDatabaseEnabled(true);
        settings.setAllowFileAccess(true);
        settings.setAllowContentAccess(true);
        settings.setAllowFileAccessFromFileURLs(true);
        settings.setAllowUniversalAccessFromFileURLs(true);
        settings.setMediaPlaybackRequiresUserGesture(false);
        settings.setCacheMode(WebSettings.LOAD_DEFAULT);
        
        // High-DPI viewport support
        settings.setUseWideViewPort(true);
        settings.setLoadWithOverviewMode(true);
        
        // Mark as native app in User-Agent
        String customUa = settings.getUserAgentString() + " XCodeChessNativeApp/1.0";
        settings.setUserAgentString(customUa);

        // Hardware acceleration
        mWebView.setLayerType(View.LAYER_TYPE_HARDWARE, null);
        mWebView.setWebViewClient(new WebViewClient() {
            @Override
            public void onPageFinished(WebView view, String url) {
                super.onPageFinished(view, url);
                view.evaluateJavascript("window.isNativeApp = true; document.body.classList.add('native-app-mode');", null);
            }
        });
        mWebView.setWebChromeClient(new WebChromeClient());

        // Load fully bundled offline application
        mWebView.loadUrl("file:///android_asset/index.html");
    }

    @Override
    public void onBackPressed() {
        if (mWebView != null && mWebView.canGoBack()) {
            mWebView.goBack();
        } else {
            super.onBackPressed();
        }
    }
}
