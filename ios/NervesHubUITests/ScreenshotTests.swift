import XCTest

@MainActor
class ScreenshotTests: XCTestCase {
  var app: XCUIApplication!

  override func setUpWithError() throws {
    continueAfterFailure = true
    app = XCUIApplication()
    setupSnapshot(app)
    app.launch()
  }

  private func tapTab(_ name: String) -> Bool {
    // iPhone: standard tab bar
    let tabBarButton = app.tabBars.buttons[name]
    if tabBarButton.waitForExistence(timeout: 3) {
      tabBarButton.tap()
      return true
    }
    // iPad: may use top tab bar or other layout
    let button = app.buttons[name]
    if button.waitForExistence(timeout: 3) {
      button.tap()
      return true
    }
    return false
  }

  func testScreenshots() throws {
    // Wait for app to load
    sleep(5)

    // 1. Devices list (home screen)
    snapshot("01_DevicesList")

    // 2. Tap first device to see detail
    let firstCell = app.cells.firstMatch
    if firstCell.waitForExistence(timeout: 5) {
      firstCell.tap()
      sleep(3)
      snapshot("02_DeviceDetail")

      // Go back
      let backButton = app.navigationBars.buttons.firstMatch
      if backButton.waitForExistence(timeout: 3) {
        backButton.tap()
        sleep(1)
      }
    }

    // 3. Firmware tab
    if tapTab("Firmware") {
      sleep(3)
      snapshot("03_Firmware")
    }

    // 4. Deployments tab
    if tapTab("Deployments") {
      sleep(3)
      snapshot("04_Deployments")
    }

    // 5. Scripts tab
    if tapTab("Scripts") {
      sleep(3)
      snapshot("05_Scripts")
    }

    // 6. Settings tab
    if tapTab("Settings") {
      sleep(3)
      snapshot("06_Settings")
    }
  }
}
