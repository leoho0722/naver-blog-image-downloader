package com.leoho.naverBlogImageDownloader.android.features.photoviewer.view

import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.core.tween
import androidx.compose.animation.fadeIn
import androidx.compose.animation.fadeOut
import androidx.compose.animation.slideInVertically
import androidx.compose.animation.slideOutVertically
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.WindowInsets
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.statusBars
import androidx.compose.foundation.layout.windowInsetsPadding
import androidx.compose.foundation.pager.HorizontalPager
import androidx.compose.foundation.pager.rememberPagerState
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.ModalBottomSheet
import androidx.compose.material3.Text
import androidx.compose.material3.rememberModalBottomSheetState
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.snapshotFlow
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.core.view.WindowCompat
import androidx.core.view.WindowInsetsCompat
import androidx.core.view.WindowInsetsControllerCompat
import com.leoho.naverBlogImageDownloader.android.features.photoviewer.viewmodel.PhotoViewerViewModel

// region PhotoViewerScreen

/**
 * 圖片檢視器主畫面 Composable。
 *
 * 使用純 [Box] 疊加自定義導航列與膠囊列，
 * [HorizontalPager] 填滿整個螢幕實現水平翻頁。
 *
 * @param viewModel 檢視器的狀態管理 ViewModel。
 */
@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun PhotoViewerScreen(viewModel: PhotoViewerViewModel) {
    val pagerState = rememberPagerState(initialPage = viewModel.currentIndex) {
        viewModel.filePaths.size
    }
    val context = LocalContext.current
    val activity = context as? PhotoViewerActivity

    // 監聽頁面變化
    LaunchedEffect(pagerState) {
        snapshotFlow { pagerState.settledPage }.collect { page ->
            viewModel.onPageChanged(page)
        }
    }

    // 沉浸模式控制系統列
    LaunchedEffect(viewModel.isImmersive) {
        activity?.let {
            val controller = WindowCompat.getInsetsController(it.window, it.window.decorView)
            controller.systemBarsBehavior =
                WindowInsetsControllerCompat.BEHAVIOR_SHOW_TRANSIENT_BARS_BY_SWIPE
            if (viewModel.isImmersive) {
                controller.hide(WindowInsetsCompat.Type.systemBars())
            } else {
                controller.show(WindowInsetsCompat.Type.systemBars())
            }
        }
    }

    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(Color.Black),
    ) {
        // 照片翻頁 — 填滿整個螢幕
        HorizontalPager(
            state = pagerState,
            modifier = Modifier.fillMaxSize(),
        ) { page ->
            ZoomableImage(
                filePath = viewModel.filePaths[page],
                onSingleTap = { viewModel.isImmersive = !viewModel.isImmersive },
            )
        }

        // 頂部自定義導航列
        AnimatedVisibility(
            visible = !viewModel.isImmersive,
            enter = fadeIn(tween(250)),
            exit = fadeOut(tween(250)),
            modifier = Modifier.align(Alignment.TopCenter),
        ) {
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .background(
                        Brush.verticalGradient(
                            colors = listOf(Color.Black.copy(alpha = 0.5f), Color.Transparent),
                        )
                    )
                    .windowInsetsPadding(WindowInsets.statusBars)
                    .padding(vertical = 4.dp),
            ) {
                // 置中標題
                Text(
                    "${viewModel.currentIndex + 1} / ${viewModel.totalCount}",
                    color = Color.White,
                    fontSize = 17.sp,
                    fontWeight = FontWeight.Medium,
                    textAlign = TextAlign.Center,
                    modifier = Modifier
                        .fillMaxWidth()
                        .align(Alignment.Center),
                )

                // 左側返回按鈕
                Row(
                    modifier = Modifier.fillMaxWidth(),
                ) {
                    IconButton(
                        onClick = { viewModel.dismiss() },
                        modifier = Modifier.padding(start = 4.dp),
                    ) {
                        Icon(
                            Icons.AutoMirrored.Filled.ArrowBack,
                            contentDescription = "Back",
                            tint = Color.White,
                        )
                    }
                    Spacer(modifier = Modifier.weight(1f))
                }
            }
        }

        // 底部膠囊列
        AnimatedVisibility(
            visible = !viewModel.isImmersive,
            enter = fadeIn(tween(250)),
            exit = fadeOut(tween(250)),
            modifier = Modifier
                .align(Alignment.BottomCenter)
                .padding(bottom = 48.dp),
        ) {
            CapsuleBottomBar(viewModel = viewModel)
        }
    }

    // 檔案資訊 Bottom Sheet
    if (viewModel.showFileInfo) {
        ModalBottomSheet(
            onDismissRequest = { viewModel.showFileInfo = false },
            sheetState = rememberModalBottomSheetState(),
            dragHandle = null,
        ) {
            FileInfoContent(viewModel = viewModel)
        }
    }
}

// endregion
