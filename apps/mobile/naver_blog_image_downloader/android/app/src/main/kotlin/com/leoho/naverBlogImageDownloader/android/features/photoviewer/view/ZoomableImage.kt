package com.leoho.naverBlogImageDownloader.android.features.photoviewer.view

import android.graphics.Bitmap
import android.graphics.BitmapFactory
import androidx.compose.foundation.Image
import androidx.compose.foundation.gestures.detectTapGestures
import androidx.compose.foundation.gestures.detectTransformGestures
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableFloatStateOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.asImageBitmap
import androidx.compose.ui.graphics.graphicsLayer
import androidx.compose.ui.input.pointer.pointerInput
import androidx.compose.ui.layout.ContentScale

// region Bitmap Cache

/** LRU 圖片快取，保持最多 7 張圖片（當前 ±3），超過時自動淘汰最舊的項目。 */
private val bitmapCache = object : LinkedHashMap<String, Bitmap>(7, 0.75f, true) {
    override fun removeEldestEntry(eldest: MutableMap.MutableEntry<String, Bitmap>?): Boolean {
        return size > 7
    }
}

// endregion

// region ZoomableImage

/**
 * 支援捏合縮放與雙擊縮放的圖片 Composable。
 *
 * 使用 [BitmapFactory.decodeFile] 載入圖片並搭配 LRU 快取機制。
 * 支援 `detectTransformGestures`（1x–5x 捏合縮放）與
 * `detectTapGestures(onDoubleTap)`（1x/3x 雙擊切換）。
 *
 * @param filePath 圖片檔案路徑。
 * @param onSingleTap 單擊時的回呼（切換沉浸模式）。
 */
@Composable
fun ZoomableImage(
    filePath: String,
    onSingleTap: () -> Unit,
) {
    var scale by remember { mutableFloatStateOf(1f) }
    var offset by remember { mutableStateOf(Offset.Zero) }

    // 換頁時重置縮放
    LaunchedEffect(filePath) {
        scale = 1f
        offset = Offset.Zero
    }

    android.util.Log.d("PhotoViewer", "ZoomableImage filePath=$filePath")
    val bitmap = remember(filePath) {
        bitmapCache[filePath] ?: BitmapFactory.decodeFile(filePath)?.also {
            bitmapCache[filePath] = it
        }
    }
    val imageBitmap = remember(bitmap) { bitmap?.asImageBitmap() }

    val isZoomed = scale > 1.01f

    if (bitmap != null && imageBitmap != null) {
        Box(
            modifier = Modifier
                .fillMaxSize()
                .then(
                    if (isZoomed) {
                        // 縮放中：攔截拖曳做平移，HorizontalPager 無法滑動
                        Modifier.pointerInput(Unit) {
                            detectTransformGestures { _, pan, zoom, _ ->
                                val newScale = (scale * zoom).coerceIn(1f, 5f)
                                scale = newScale
                                if (newScale > 1f) {
                                    offset = Offset(
                                        x = offset.x + pan.x,
                                        y = offset.y + pan.y,
                                    )
                                } else {
                                    offset = Offset.Zero
                                }
                            }
                        }
                    } else {
                        // 未縮放：不攔截拖曳，讓 HorizontalPager 處理滑動
                        Modifier
                    }
                )
                .pointerInput(Unit) {
                    detectTapGestures(
                        onDoubleTap = {
                            if (scale > 1.01f) {
                                scale = 1f
                                offset = Offset.Zero
                            } else {
                                scale = 3f
                            }
                        },
                        onTap = { onSingleTap() },
                    )
                },
            contentAlignment = Alignment.Center,
        ) {
            Image(
                bitmap = imageBitmap,
                contentDescription = null,
                contentScale = ContentScale.Fit,
                modifier = Modifier
                    .fillMaxSize()
                    .graphicsLayer(
                        scaleX = scale,
                        scaleY = scale,
                        translationX = offset.x,
                        translationY = offset.y,
                    ),
            )
        }
    }
}

// endregion
