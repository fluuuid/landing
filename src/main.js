import "./style.css";
import "@fontsource-variable/manrope";
import "@fontsource/dm-mono/latin-400.css";
import fragment from "./atmosphere.frag?raw";
import { INTRO_DURATION, introAt } from "./intro.js";

document.querySelector("#year").textContent = new Date().getFullYear();
const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)");
const canvas = document.querySelector("#atmosphere");
const logoImage = document.querySelector(".hero-logo");
const replay = document.querySelector("#replay-intro");
let restart = () => {};
let start = performance.now();
let introTimer;
function startIntro() {
  start = performance.now();
  clearTimeout(introTimer);
  document.body.classList.toggle("is-intro", !reducedMotion.matches);
  document.body.classList.toggle("is-ready", reducedMotion.matches);
  replay.disabled = reducedMotion.matches;
  if (!reducedMotion.matches)
    introTimer = setTimeout(() => {
      document.body.classList.remove("is-intro");
      document.body.classList.add("is-ready");
    }, INTRO_DURATION * 1000);
  restart();
}
replay.addEventListener("click", startIntro);
reducedMotion.addEventListener("change", startIntro);
function createRenderer() {
  const gl = canvas.getContext("webgl", {
    alpha: false,
    antialias: false,
    powerPreference: "low-power",
  });
  if (!gl) return null;
  const shaders = [];
  const program = gl.createProgram();
  for (const [type, source] of [
    [
      gl.VERTEX_SHADER,
      "attribute vec2 aPosition; void main(){gl_Position=vec4(aPosition,0.,1.);}",
    ],
    [gl.FRAGMENT_SHADER, fragment],
  ]) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS))
      throw new Error(gl.getShaderInfoLog(shader));
    gl.attachShader(program, shader);
    shaders.push(shader);
  }
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS))
    throw new Error(gl.getProgramInfoLog(program));
  shaders.forEach((shader) => gl.deleteShader(shader));
  gl.useProgram(program);
  const buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(
    gl.ARRAY_BUFFER,
    new Float32Array([-1, -1, 3, -1, -1, 3]),
    gl.STATIC_DRAW,
  );
  const position = gl.getAttribLocation(program, "aPosition");
  gl.enableVertexAttribArray(position);
  gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);
  const uniforms = Object.fromEntries(
    [
      "Resolution",
      "Pointer",
      "LogoRect",
      "Time",
      "Glitch",
      "Tear",
      "Motion",
      "Logo",
    ].map((name) => [name, gl.getUniformLocation(program, `u${name}`)]),
  );
  const texture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
  gl.texImage2D(
    gl.TEXTURE_2D,
    0,
    gl.RGBA,
    gl.RGBA,
    gl.UNSIGNED_BYTE,
    logoImage,
  );
  gl.uniform1i(uniforms.Logo, 0);
  let raf = 0,
    lost = false,
    rect;
  let pointer = [0.5, 0.5],
    target = [0.5, 0.5];
  function measure() {
    rect = logoImage.getBoundingClientRect();
  }
  function resize() {
    const dpr = Math.min(devicePixelRatio || 1, 1.5);
    canvas.width = Math.round(innerWidth * dpr);
    canvas.height = Math.round(innerHeight * dpr);
    gl.viewport(0, 0, canvas.width, canvas.height);
    measure();
    requestRender();
  }
  function draw(now) {
    raf = 0;
    if (document.hidden || lost) return;
    const seconds = (now - start) / 1000;
    const { glitch, tear } = reducedMotion.matches
      ? { glitch: 0, tear: 0 }
      : introAt(seconds);
    pointer = pointer.map(
      (value, index) => value + (target[index] - value) * 0.065,
    );
    gl.uniform2f(uniforms.Resolution, canvas.width, canvas.height);
    gl.uniform2f(uniforms.Pointer, ...pointer);
    gl.uniform4f(
      uniforms.LogoRect,
      rect.left / innerWidth,
      1 - rect.bottom / innerHeight,
      rect.width / innerWidth,
      rect.height / innerHeight,
    );
    gl.uniform1f(uniforms.Time, reducedMotion.matches ? 3 : seconds);
    gl.uniform1f(uniforms.Glitch, glitch);
    gl.uniform1f(uniforms.Tear, tear);
    gl.uniform1f(uniforms.Motion, reducedMotion.matches ? 0 : 1);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
    if (!reducedMotion.matches) requestRender();
  }
  function requestRender() {
    if (!raf && !lost && !document.hidden) raf = requestAnimationFrame(draw);
  }
  window.addEventListener("resize", resize, { passive: true });
  window.addEventListener(
    "scroll",
    () => {
      measure();
      requestRender();
    },
    { passive: true },
  );
  window.addEventListener(
    "pointermove",
    (event) => {
      target = [event.clientX / innerWidth, 1 - event.clientY / innerHeight];
    },
    { passive: true },
  );
  document.addEventListener("visibilitychange", () => {
    cancelAnimationFrame(raf);
    raf = 0;
    if (!document.hidden) requestRender();
  });
  canvas.addEventListener("webglcontextlost", (event) => {
    event.preventDefault();
    lost = true;
    cancelAnimationFrame(raf);
    document.body.classList.remove("has-webgl");
    canvas.hidden = true;
  });
  resize();
  document.body.classList.add("has-webgl");
  return requestRender;
}
async function init() {
  try {
    await logoImage.decode();
    restart = createRenderer() || restart;
  } catch (error) {
    console.warn("Using the static logo fallback:", error);
    canvas.hidden = true;
  }
  startIntro();
}
init();
