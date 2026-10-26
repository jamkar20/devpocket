package main

import (
	"context"
)

// App struct
type App struct {
	ctx context.Context
}

type DesktopInfo struct {
	Name    string `json:"name"`
	Version string `json:"version"`
}

// NewApp creates a new App application struct
func NewApp() *App {
	return &App{}
}

// startup is called when the app starts. The context is saved
// so we can call the runtime methods
func (a *App) startup(ctx context.Context) {
	a.ctx = ctx
}

func (a *App) GetInfo() DesktopInfo {
	return DesktopInfo{
		Name:    "DevPocket",
		Version: "0.1.0",
	}
}
