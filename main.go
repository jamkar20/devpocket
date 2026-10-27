package main

import (
	"embed"

	"github.com/wailsapp/wails/v3/pkg/application"
)

//go:embed frontend/dist
var assets embed.FS

func main() {
	// Create an instance of the app structure
	app := application.New(application.Options{
		Name: "DevPocket",
		Assets: application.AssetOptions{
			Handler: application.AssetFileServerFS(assets),
		},
		Services: []application.Service{},
	})

	app.RegisterService(application.NewService(NewMainService(app)))

	app.Window.NewWithOptions(application.WebviewWindowOptions{
		Title:            "DevPocket",
		MinWidth:         850,
		MinHeight:        650,
		BackgroundColour: application.NewRGBA(27, 38, 54, 1),
	})

	err := app.Run()
	if err != nil {
		panic(err)
	}
}
