/**
 * Whether WebGL runs on real GPU hardware. Software rasterizers
 * (SwiftShader, llvmpipe) take tens of CPU-seconds to compile the
 * hillshade/terrain shaders — on such clients the relief layer is
 * skipped so the map stays responsive.
 */
export const hasHardwareGl = (): boolean => {
  try {
    const canvas = document.createElement('canvas');
    const gl =
      canvas.getContext('webgl2') ?? canvas.getContext('webgl');
    const info = gl?.getExtension('WEBGL_debug_renderer_info');
    const renderer = `${gl?.getParameter(
      info?.UNMASKED_RENDERER_WEBGL ?? gl.RENDERER,
    )}`;
    return !/swiftshader|llvmpipe|software|basic render/i.test(renderer);
  } catch {
    return false;
  }
};
