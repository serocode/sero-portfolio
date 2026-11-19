let hardware: boolean | undefined;

/**
 * True when WebGL is drawn by a GPU. Software renderers (SwiftShader, llvmpipe — VMs, blocklisted
 * GPUs, headless lab runs) draw on the CPU, where the hero cube and the helix would hold the main
 * thread every frame. Without a GPU the 3D sections keep their flat fallbacks and `data-three` is
 * dropped, so no scroll runway or helix track is laid out. Probed once, after hydration.
 */
export function hardwareWebGL(): boolean {
	if (hardware !== undefined) return hardware;
	hardware = false;
	try {
		const gl = document
			.createElement('canvas')
			.getContext('webgl', { failIfMajorPerformanceCaveat: true });
		if (gl) {
			const info = gl.getExtension('WEBGL_debug_renderer_info');
			const name = String(gl.getParameter(info ? info.UNMASKED_RENDERER_WEBGL : gl.RENDERER) ?? '');
			hardware = !/swiftshader|llvmpipe|softpipe|software|basic render/i.test(name);
			gl.getExtension('WEBGL_lose_context')?.loseContext();
		}
	} catch {}
	if (!hardware) delete document.documentElement.dataset.three;
	return hardware;
}
