package com.leoho.naverBlogImageDownloader.android.features.photoviewer.view

import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.leoho.naverBlogImageDownloader.android.features.photoviewer.viewmodel.PhotoViewerViewModel

// region FileInfoContent

/**
 * 檔案資訊 Bottom Sheet 內容，顯示檔案大小與圖片尺寸。
 *
 * 使用 Flutter 傳入的 l10n 字串作為標籤文字。
 *
 * @param viewModel 檢視器的 ViewModel，用於讀取檔案資訊與 l10n 字串。
 */
@Composable
fun FileInfoContent(viewModel: PhotoViewerViewModel) {
    val contentColor = MaterialTheme.colorScheme.inverseSurface

    Column(modifier = Modifier.padding(vertical = 16.dp)) {
        Text(
            text = viewModel.localizedStrings["fileInfo"] ?: "File Info",
            fontSize = 18.sp,
            fontWeight = FontWeight.Bold,
            color = contentColor,
            modifier = Modifier
                .fillMaxWidth()
                .padding(bottom = 8.dp),
            textAlign = TextAlign.Center,
        )

        val info = viewModel.fileInfo(viewModel.currentIndex)

        if (info != null) {
            Row(modifier = Modifier.padding(horizontal = 16.dp, vertical = 6.dp)) {
                Text(
                    viewModel.localizedStrings["fileSize"] ?: "File Size",
                    color = contentColor,
                )
                Spacer(modifier = Modifier.weight(1f))
                Text(
                    info.formattedFileSize,
                    fontSize = 16.sp,
                    color = contentColor.copy(alpha = 0.6f),
                )
            }
            Row(modifier = Modifier.padding(horizontal = 16.dp, vertical = 6.dp)) {
                Text(
                    viewModel.localizedStrings["dimensions"] ?: "Dimensions",
                    color = contentColor,
                )
                Spacer(modifier = Modifier.weight(1f))
                Text(
                    info.formattedDimensions,
                    fontSize = 16.sp,
                    color = contentColor.copy(alpha = 0.6f),
                )
            }
        }
    }
}

// endregion
