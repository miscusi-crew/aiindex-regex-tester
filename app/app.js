"use strict";
const $ = (id) => document.getElementById(id);
const FLAGS = { g: "global", i: "ignore case", m: "multiline", s: "dot matches newline", u: "unicode" };
for (const [f, label] of Object.entries(FLAGS)) {
  const l = document.createElement("label");
  l.innerHTML = `<input type="checkbox" value="${f}" ${f === "g" ? "checked" : ""}> <code>${f}</code> ${label}`;
  $("flags").append(l);
}
const esc = (s) => s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);

function run() {
  const text = $("text").value;
  const flags = [...document.querySelectorAll("#flags input:checked")].map((i) => i.value).join("");
  let re;
  try {
    re = new RegExp($("re").value, flags.includes("g") ? flags : flags + "g");
    $("err").textContent = "";
  } catch (e) {
    $("err").textContent = e.message;
    $("hl").innerHTML = esc(text);
    $("rows").innerHTML = "";
    $("count").textContent = "0";
    return;
  }
  const matches = [];
  if ($("re").value) {
    for (const m of text.matchAll(re)) {
      matches.push(m);
      if (!flags.includes("g") || matches.length >= 1000) break;
      if (m[0] === "") re.lastIndex++;
    }
  }
  let html = "", last = 0;
  for (const m of matches) {
    if (!m[0]) continue;
    html += esc(text.slice(last, m.index)) + `<mark>${esc(m[0])}</mark>`;
    last = m.index + m[0].length;
  }
  $("hl").innerHTML = html + esc(text.slice(last)) + "\n";
  $("count").textContent = matches.length;
  $("rows").innerHTML = matches.slice(0, 200).map((m, i) =>
    `<tr><td>${i + 1}</td><td>${esc(m[0]) || "<em>empty</em>"}</td><td>${m.index}</td><td>${m.slice(1).map((g, j) => `${j + 1}: ${g === undefined ? "–" : esc(g)}`).join("<br>")}${m.groups ? "<br>" + Object.entries(m.groups).map(([k, v]) => `${esc(k)}: ${esc(v ?? "–")}`).join("<br>") : ""}</td></tr>`).join("");
}
function syncScroll() { $("hl").scrollTop = $("text").scrollTop; }
$("re").addEventListener("input", run);
$("text").addEventListener("input", run);
$("text").addEventListener("scroll", syncScroll);
$("flags").addEventListener("change", run);
new ResizeObserver(() => { $("hl").style.height = `${$("text").offsetHeight}px`; }).observe($("text"));
run();
