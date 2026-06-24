import java.util.Properties

plugins {
    id("com.android.application")
    id("kotlin-android")
    id("org.jetbrains.kotlin.plugin.compose")
    // The Flutter Gradle Plugin must be applied after the Android and Kotlin Gradle plugins.
    id("dev.flutter.flutter-gradle-plugin")
    id("com.google.gms.google-services")
    id("com.google.firebase.crashlytics")
    id("de.mannodermaus.android-junit")
}

// 讀取 release signing 設定（`apps/mobile/android/key.properties`）。
// 本機開發時由開發者自 `key.properties.template` 複製產生；
// CI/CD 由 workflow 於 runtime 從 GitHub Secrets 還原。
// 此檔案未提供時 release buildType 會 fallback 回 debug key，讓 `flutter run --release` 在沒有 keystore 的機器上仍可執行。
val keystoreProperties = Properties().apply {
    val keystoreFile = rootProject.file("key.properties")
    if (keystoreFile.exists()) {
        keystoreFile.inputStream().use { load(it) }
    }
}

android {
    namespace = "com.leoho.naverBlogImageDownloader.android"
    compileSdk = flutter.compileSdkVersion
    ndkVersion = flutter.ndkVersion

    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }

    kotlinOptions {
        jvmTarget = JavaVersion.VERSION_17.toString()
    }

    buildFeatures {
        compose = true
    }

    defaultConfig {
        applicationId = "com.leoho.naverBlogImageDownloader.android"
        testApplicationId = "com.leoho.naverBlogImageDownloader.android.tests"
        // You can update the following values to match your application needs.
        // For more information, see: https://flutter.dev/to/review-gradle-config.
        minSdk = 34
        targetSdk = flutter.targetSdkVersion
        versionCode = flutter.versionCode
        versionName = flutter.versionName
    }

    signingConfigs {
        create("release") {
            // Release signing 設定來源：`apps/mobile/android/key.properties`
            // `storeFile` 欄位的 path 相對於 `apps/mobile/android/`（rootProject），
            // 符合 Flutter 官方 key.properties 慣例（例如 `app/keystore.jks`）。
            // 缺檔時 storeFile 會是 null，Gradle 仍能完成 evaluation；
            // 實際 `assembleRelease` / `bundleRelease` 在沒有 keystore 時會報錯（預期行為）。
            val storeFilePath = keystoreProperties.getProperty("storeFile")
            if (storeFilePath != null) {
                storeFile = rootProject.file(storeFilePath)
            }
            storePassword = keystoreProperties.getProperty("storePassword")
            keyAlias = keystoreProperties.getProperty("keyAlias")
            keyPassword = keystoreProperties.getProperty("keyPassword")
        }
    }

    buildTypes {
        release {
            // 有 `key.properties` 時用 release signing；否則 fallback 回 debug key，
            // 讓沒有 keystore 的機器仍可 `flutter run --release`。
            signingConfig = if (!keystoreProperties.isEmpty) {
                signingConfigs.getByName("release")
            } else {
                signingConfigs.getByName("debug")
            }
        }
    }
}

dependencies {
    val composeBom = platform("androidx.compose:compose-bom:2025.04.00")
    implementation(composeBom)
    implementation("androidx.compose.material3:material3")
    implementation("androidx.compose.material:material-icons-extended")
    implementation("androidx.compose.foundation:foundation")
    implementation("androidx.activity:activity-compose:1.10.1")

    testImplementation(platform("org.junit:junit-bom:6.0.3"))
    testImplementation("org.junit.jupiter:junit-jupiter")
    testImplementation(kotlin("test"))
    testImplementation("org.jetbrains.kotlinx:kotlinx-coroutines-test:1.10.2")
}

flutter {
    source = "../.."
}
