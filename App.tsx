import { SafeAreaView, StyleSheet, StatusBar } from 'react-native';
import { WebView } from 'react-native-webview';

export default function App() {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        backgroundColor="#0f172a"
        barStyle="light-content"
      />
      <WebView
        source={{ uri: 'file:///android_asset/www/index.html' }}
        style={styles.webview}
        javaScriptEnabled
        domStorageEnabled
        allowFileAccess
        allowFileAccessFromFileURLs
        allowUniversalAccessFromFileURLs
        originWhitelist={['*']}
        mixedContentMode="always"
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f172a' },
  webview: { flex: 1 },
});
