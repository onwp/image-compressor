# Image Compressor

A desktop application built with Electron that allows you to compress images efficiently while maintaining quality. This tool helps reduce image file sizes for web usage, storage optimization, or sharing purposes.

## Downloads

Pre-built binaries are available for all major platforms. Download the latest version for your operating system:

### macOS
- Intel (x64): [Image Compressor-x64.dmg](../../releases/latest/download/Image.Compressor-x64.dmg)
- Apple Silicon (arm64): [Image Compressor-arm64.dmg](../../releases/latest/download/Image.Compressor-arm64.dmg)

### Windows
- Installer: [Image Compressor-Setup.exe](../../releases/latest/download/Image.Compressor-Setup.exe)
- Portable: [Image Compressor-portable.exe](../../releases/latest/download/Image.Compressor-portable.exe)

### Linux
- AppImage: [Image Compressor.AppImage](../../releases/latest/download/Image.Compressor.AppImage)
- Debian/Ubuntu: [image-compressor.deb](../../releases/latest/download/image-compressor.deb)

[View all releases](../../releases)

## Features

- Simple and intuitive user interface
- Drag and drop functionality for images
- Supports multiple image formats (PNG, JPG, JPEG)
- Adjustable compression settings
- Batch processing capability
- Preview compressed images before saving
- Maintains EXIF data (optional)

## Building from Source

Make sure you have [Node.js](https://nodejs.org/) installed on your system.

1. Clone this repository:
```bash
git clone https://github.com/yourusername/image-compressor.git
cd image-compressor
```

2. Install dependencies:
```bash
npm install
```

3. Start the application in development mode:
```bash
npm start
```

4. Build the application for your platform:
```bash
# Build for all platforms
npm run dist

# Build for specific platforms
npm run dist:mac    # macOS
npm run dist:win    # Windows
npm run dist:linux  # Linux
```

The built applications will be available in the `dist` directory.

## Development

- Run the app in development mode:
```bash
npm run dev
```

- The application uses Electron for the desktop interface
- Main process code is in `main.js`
- Renderer process code is in the `src` directory

## Tech Stack

- Electron
- Node.js
- HTML/CSS/JavaScript
- Sharp (for image processing)

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Electron.js team for the amazing framework
- Sharp library for image processing capabilities
- All contributors who help improve this project 