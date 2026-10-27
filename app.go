package main

import (
	"context"

	"github.com/wailsapp/wails/v3/pkg/application"
)

type MainService struct {
	app *application.App
}

func NewMainService(app *application.App) *MainService {
	return &MainService{app: app}
}

type DesktopInfo struct {
	Name    string `json:"name"`
	Version string `json:"version"`
}

func (s *MainService) ServiceStartup(ctx context.Context, options application.ServiceOptions) error {
	// Initialisation
	return nil
}

func (a *MainService) GetInfo() DesktopInfo {
	return DesktopInfo{
		Name:    "DevPocket",
		Version: "0.2.0",
	}
}
