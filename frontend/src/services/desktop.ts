export interface DesktopInfo {
  name: string;
  version: string;
}

export async function getDesktopInfo(): Promise<DesktopInfo> {
  const { GetInfo } = await import("../../wailsjs/go/main/App");

  return GetInfo();
}
