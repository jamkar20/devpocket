import { MainService, DesktopInfo } from "../../bindings/DevPocket";

export { DesktopInfo } from "../../bindings/DevPocket";

export async function getDesktopInfo(): Promise<DesktopInfo> {
  return MainService.GetInfo();
}
