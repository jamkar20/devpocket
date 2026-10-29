package main

import (
	"embed"

	"github.com/kbinani/screenshot"
	"github.com/wailsapp/wails/v3/pkg/application"
)

//go:embed frontend/dist
var assets embed.FS

func main() {
	app := application.New(application.Options{
		Name: "DevPocket",
		Assets: application.AssetOptions{
			Handler: application.AssetFileServerFS(assets),
		},
		Services: []application.Service{},
	})

	app.RegisterService(application.NewService(NewMainService(app)))

	// Get the primary display dimensions.
	bounds := screenshot.GetDisplayBounds(0)

	// Set the initial window size to 60% of the display.
	width := bounds.Dx() * 60 / 100
	height := bounds.Dy() * 80 / 100

	app.Window.NewWithOptions(application.WebviewWindowOptions{
		Title:            "DevPocket",
		Width:            width,
		Height:           height,
		MinWidth:         800,
		MinHeight:        600,
		BackgroundColour: application.NewRGBA(27, 38, 54, 1),
	})

	if err := app.Run(); err != nil {
		panic(err)
	}
}
