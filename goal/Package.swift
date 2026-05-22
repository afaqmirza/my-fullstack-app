// swift-tools-version:5.9
import PackageDescription

let package = Package(
    name: "swift",
    platforms: [
        .macOS(.v13),
        .iOS(.v16)
    ],
    products: [
        .executable(name: "swift", targets: ["swift"])
    ],
    dependencies: [],
    targets: [
        .executableTarget(
            name: "swift",
            path: "Sources/swift"
        )
    ]
)
