/* Decorative macOS window controls. Non-functional until the Tauri shell
 * wires real minimize/maximize/close. Colors are constant across themes. */
export function TrafficLights() {
  return (
    <div className="flex gap-2" aria-hidden>
      <span className="size-3 rounded-full bg-[var(--tl-red)]" />
      <span className="size-3 rounded-full bg-[var(--tl-yellow)]" />
      <span className="size-3 rounded-full bg-[var(--tl-green)]" />
    </div>
  );
}
