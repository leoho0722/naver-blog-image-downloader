import 'dart:async';
import 'dart:ui';

import 'package:amplify_api/amplify_api.dart';
import 'package:amplify_flutter/amplify_flutter.dart';
import 'package:firebase_core/firebase_core.dart';
import 'package:firebase_crashlytics/firebase_crashlytics.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:shared_preferences/shared_preferences.dart';

import 'amplifyconfiguration.dart';
import 'app.dart';
import 'data/services/auth_service.dart';
import 'data/services/crashlytics_service.dart';
import 'data/services/local_storage_service.dart';

/// 應用程式進入點，負責初始化 Amplify SDK、Firebase 與 Crashlytics 並啟動 [NaverPhotoApp]。
///
/// 依序執行：
/// 1. Flutter binding 初始化
/// 2. Amplify SDK 配置
/// 3. Firebase 初始化 + Crashlytics 全域錯誤攔截
/// 4. 匿名登入（fire-and-forget，不阻塞啟動）
/// 5. [SharedPreferences] 載入
/// 6. 以 [ProviderScope] 建立 Riverpod 依賴注入容器並啟動應用程式
Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await _configureAmplify();
  await _configureFirebase();
  final prefs = await SharedPreferences.getInstance();

  runApp(
    ProviderScope(
      overrides: [sharedPreferencesProvider.overrideWithValue(prefs)],
      child: const NaverPhotoApp(),
    ),
  );
}

/// 初始化 Amplify SDK，註冊 REST API 插件。
///
/// 若 Amplify 已經初始化過（[AmplifyAlreadyConfiguredException]），
/// 則靜默忽略；其他例外則印出錯誤訊息。
Future<void> _configureAmplify() async {
  try {
    final apiPlugin = AmplifyAPI();
    await Amplify.addPlugins([apiPlugin]);
    await Amplify.configure(amplifyConfig);
    safePrint('Amplify 初始化成功');
  } on AmplifyAlreadyConfiguredException {
    safePrint('Amplify 已初始化，略過');
  } on Exception catch (e) {
    safePrint('Amplify 初始化失敗：$e');
  }
}

/// 初始化 Firebase SDK、設定 Crashlytics 全域錯誤攔截，並觸發匿名登入。
///
/// - [Firebase.initializeApp] 讀取原生設定檔（`GoogleService-Info.plist` / `google-services.json`）
/// - [FlutterError.onError] 攔截 Flutter framework 層的致命錯誤
/// - [PlatformDispatcher.instance.onError] 攔截非 Flutter 的 platform 層錯誤
/// - [AuthService.ensureSignedIn] 以 fire-and-forget 方式匿名登入（不阻塞 App 啟動）
Future<void> _configureFirebase() async {
  try {
    await Firebase.initializeApp();

    // 攔截 Flutter framework 層的致命錯誤
    FlutterError.onError = FirebaseCrashlytics.instance.recordFlutterFatalError;

    // 攔截非 Flutter 的 platform 層錯誤
    PlatformDispatcher.instance.onError = (error, stack) {
      FirebaseCrashlytics.instance.recordError(error, stack, fatal: true);
      return true;
    };

    // 匿名登入（fire-and-forget，不阻塞啟動）
    unawaited(
      AuthService(crashlyticsService: CrashlyticsService()).ensureSignedIn(),
    );

    safePrint('Firebase 初始化成功');
  } on Exception catch (e) {
    safePrint('Firebase 初始化失敗：$e');
  }
}
