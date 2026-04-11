package com.leoho.naverBlogImageDownloader.android.features.photoviewer.view

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Check
import androidx.compose.material.icons.outlined.Info
import androidx.compose.material.icons.outlined.SaveAlt
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.VerticalDivider
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.dp
import com.leoho.naverBlogImageDownloader.android.features.photoviewer.viewmodel.PhotoViewerViewModel

// region CapsuleBottomBar

/**
 * 底部膠囊操作列，包含資訊按鈕與儲存按鈕。
 *
 * @param viewModel 檢視器的 ViewModel，用於讀取儲存狀態與觸發操作。
 */
@Composable
fun CapsuleBottomBar(viewModel: PhotoViewerViewModel) {
    Row(
        modifier = Modifier
            .background(
                color = Color.DarkGray.copy(alpha = 0.85f),
                shape = RoundedCornerShape(28.dp),
            )
            .padding(horizontal = 4.dp),
        verticalAlignment = Alignment.CenterVertically,
    ) {
        IconButton(onClick = { viewModel.showFileInfo = true }) {
            Icon(
                Icons.Outlined.Info,
                contentDescription = "Info",
                tint = Color.White,
            )
        }

        VerticalDivider(
            modifier = Modifier.height(24.dp),
            thickness = 1.dp,
            color = Color.White.copy(alpha = 0.3f),
        )

        IconButton(
            onClick = { viewModel.save() },
            enabled = viewModel.viewState == PhotoViewerViewModel.ViewState.Idle,
        ) {
            when (viewModel.viewState) {
                PhotoViewerViewModel.ViewState.Idle -> Icon(
                    Icons.Outlined.SaveAlt,
                    contentDescription = "Save",
                    tint = Color.White,
                )

                PhotoViewerViewModel.ViewState.Saving -> CircularProgressIndicator(
                    modifier = Modifier.size(20.dp),
                    color = Color.White,
                    strokeWidth = 2.dp,
                )

                PhotoViewerViewModel.ViewState.Saved -> Icon(
                    Icons.Filled.Check,
                    contentDescription = "Saved",
                    tint = Color.White,
                )
            }
        }
    }
}

// endregion
