import {
  closeWindow,
  minimizeWindow,
  toggleMaximizeWindow,
} from "@/lib/window-controls";

/* macOS-style window controls. Functional inside Tauri (close / minimize /
 * maximize); inert but identical in the plain browser preview. Colors are
 * constant across themes. */
export function TrafficLights() {
  return (
    <div className="flex gap-2">
      <button
        type="button"
        aria-label="Close"
        onClick={closeWindow}
        className="size-3 rounded-full bg-[var(--tl-red)] transition-transform hover:scale-110"
      />
      <button
        type="button"
        aria-label="Minimize"
        onClick={minimizeWindow}
        className="size-3 rounded-full bg-[var(--tl-yellow)] transition-transform hover:scale-110"
      />
      <button
        type="button"
        aria-label="Maximize"
        onClick={toggleMaximizeWindow}
        className="size-3 rounded-full bg-[var(--tl-green)] transition-transform hover:scale-110"
      />
    </div>
  );
}
