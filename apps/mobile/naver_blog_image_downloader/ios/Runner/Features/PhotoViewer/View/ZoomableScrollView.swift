import UIKit

/// 支援捏合縮放的 UIScrollView 子類。
///
/// 在 `layoutSubviews` 時機計算 aspect fit 尺寸，
/// 確保 bounds 已就緒後才設定 imageView frame。
/// 使用 `contentInset` 置中圖片，自動跟隨 safe area 變化。
final class ZoomableScrollView: UIScrollView {

    // MARK: - Properties

    /// 要顯示的圖片，設定後自動重設縮放並觸發重新 layout。
    var image: UIImage? {
        didSet {
            imageView.image = image
            zoomScale = 1.0
            needsImageLayout = true
            setNeedsLayout()
        }
    }

    /// 顯示圖片的 UIImageView。
    private let imageView = UIImageView()

    /// 是否需要重新計算 layout（圖片變更或首次 layout 時設為 true）。
    private var needsImageLayout = false

    // MARK: - Initialization

    override init(frame: CGRect) {
        super.init(frame: frame)
        setupScrollView()
    }

    @available(*, unavailable)
    required init?(coder: NSCoder) {
        fatalError("init(coder:) has not been implemented")
    }

    // MARK: - Layout

    override func layoutSubviews() {
        super.layoutSubviews()

        if needsImageLayout, bounds.size != .zero, imageView.image != nil {
            needsImageLayout = false
            fitImageToView()
        } else if imageView.image != nil {
            // bounds 變化時（如 safe area 切換）重新置中
            updateContentInset()
        }
    }
}

// MARK: - UIScrollViewDelegate

extension ZoomableScrollView: UIScrollViewDelegate {

    func viewForZooming(in scrollView: UIScrollView) -> UIView? {
        imageView
    }

    func scrollViewDidZoom(_ scrollView: UIScrollView) {
        updateContentInset()
    }
}

// MARK: - Private Methods

private extension ZoomableScrollView {

    /// 初始設定 scrollView 與 imageView。
    func setupScrollView() {
        delegate = self
        minimumZoomScale = 1.0
        maximumZoomScale = 5.0
        showsHorizontalScrollIndicator = false
        showsVerticalScrollIndicator = false
        bouncesZoom = true
        backgroundColor = .clear
        contentInsetAdjustmentBehavior = .never

        imageView.contentMode = .scaleAspectFit
        addSubview(imageView)
    }

    /// 以 aspect fit 方式計算並設定 imageView frame。
    func fitImageToView() {
        guard let image = imageView.image else {
            return
        }

        let boundsSize = bounds.size
        let imageSize = image.size

        let widthRatio = boundsSize.width / imageSize.width
        let heightRatio = boundsSize.height / imageSize.height
        let fitScale = min(widthRatio, heightRatio)
        let fitSize = CGSize(
            width: imageSize.width * fitScale,
            height: imageSize.height * fitScale
        )

        imageView.frame = CGRect(origin: .zero, size: fitSize)
        contentSize = fitSize
        updateContentInset()
    }

    /// 透過 contentInset 將圖片水平垂直置中。
    ///
    /// 當圖片（含縮放）小於可視區域時，用 inset 補足差距使其置中。
    func updateContentInset() {
        let boundsSize = bounds.size
        let contentWidth = contentSize.width
        let contentHeight = contentSize.height

        let horizontalInset = max((boundsSize.width - contentWidth) / 2, 0)
        let verticalInset = max((boundsSize.height - contentHeight) / 2, 0)

        contentInset = UIEdgeInsets(
            top: verticalInset,
            left: horizontalInset,
            bottom: verticalInset,
            right: horizontalInset
        )
    }
}
