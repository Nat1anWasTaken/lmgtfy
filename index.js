"use strict"

/** @type {{search: string; lucky?: boolean;}} */
const query = window.location.search
  .substr(1)
  .split("&")
  .map(keyValue => keyValue.split("="))
  .map(([key, value]) => ({
    [decodeURIComponent(key)]: decodeURIComponent(
      value?.replaceAll("+", "%20")
    ),
  }))
  .reduce((previous, current) => ({ ...previous, ...current }), {})

/** @type {HTMLInputElement} */
let input

window.addEventListener("load", async () => {
  input = document.getElementById("input")
  input.value = ""

  setBrightness(JSON.parse(localStorage.getItem("dark") ?? "false"))

  if (!query.search) return

  await setMessage("第一步:", "輸入你的問題。")
  const cursor = makeCursor()
  await move(cursor, input)
  input.focus()
  await write()
  await new Promise(resolve => setTimeout(resolve, 1000))
  input.blur()

  await setMessage("第二步:", "點那個「搜尋」按鈕")
  const button = query.lucky
    ? document.getElementById("lucky")
    : document.getElementById("search")
  await move(cursor, button)
  button.focus()
  await new Promise(resolve => setTimeout(resolve, 1000))

  await setMessage("完成!", "拜託，這真的有那麼難嗎?", "alert-success")
  await new Promise(resolve => setTimeout(resolve, 3000))

  window.location.href = `https://www.google.com/search?${
    query.lucky ? "btnI&" : ""
  }q=${query.search}`
})

function makeCursor() {
  const dark = JSON.parse(localStorage.getItem("dark") ?? "false")

  const cursor = document.createElement("span")
  cursor.innerHTML = `
  <svg xmlns="http://www.w3.org/2000/svg" style="enable-background:new 0 0 96.09 122.88" viewBox="0 0 96.09 122.88">
    <path d="m61.61 122.31-4.15.37-3.55-2.67-14.88-25.65-14.15 15.88-6.37 4.75-4.84.56-4.2-3.01-1.57-5.39L.01 4.41 0 4.18l.37-1.84L1.74.64l.84-.41 1.79-.2 1.64.52.49.3 84.88 58.11 3.88 4.05.5 5.14-2.9 3.91-7.3 3.14-.1.02-20.73 4.29 14.77 25.73.54 4.39-2.59 3.56-.17.1-15.34 8.86-.33.16z" style="stroke:#000;stroke-width:5px;fill:#fff"/>
  </svg>`

  cursor.id = "cursor"
  document.body.appendChild(cursor)
  return cursor
}

/**
 * Move the cursor to the targeted element
 * @param {HTMLSpanElement} cursor
 * @param {HTMLButtonElement} target
 */
async function move(cursor, target) {
  return new Promise(resolve => {
    const diffX =
      target.getBoundingClientRect().left +
      target.clientWidth / 2 -
      cursor.getBoundingClientRect().left
    const diffY =
      target.getBoundingClientRect().top +
      target.clientHeight / 2 -
      cursor.getBoundingClientRect().top

    const steps = 60
    const stepX = diffX / steps
    const stepY = diffY / steps

    let step = 0
    const interval = setInterval(frame, 1000 / 60)

    function frame() {
      if (step >= steps) {
        clearInterval(interval)
        resolve()
      } else {
        step++
        cursor.style.top = (parseFloat(cursor.style.top) || 0) + stepY + "px"
        cursor.style.left = (parseFloat(cursor.style.left) || 0) + stepX + "px"
      }
    }
  })
}

async function write() {
  for (const letter of query.search) {
    await new Promise(resolve => setTimeout(resolve, Math.random() * 200 + 100))
    input.value += letter
    input.scrollLeft = input.scrollWidth
  }
}

/**
 * Set the message box under the search buttons.
 * @param {string} heading
 * @param {string} content
 * @param {string} type
 */
async function setMessage(heading, content, type = "alert-primary") {
  const message = document.getElementById("message")

  message.classList.add("opacity-0")
  await new Promise(resolve => setTimeout(resolve, 300))

  message.classList.remove("alert-primary")
  message.classList.remove("alert-success")
  message.classList.add(type)
  document.getElementById("message-heading").innerText = heading
  document.getElementById("message-content").innerText = content

  message.classList.remove("opacity-0")
  await new Promise(resolve => setTimeout(resolve, 300))
}

function toggleBrightness() {
  const dark = JSON.parse(localStorage.getItem("dark") ?? "false")
  localStorage.setItem("dark", !dark)
  setBrightness(!dark)
}

/**
 * Apply brightness on the page.
 * @param {boolean} dark
 */
function setBrightness(dark) {
  const newbrightness = dark ? "dark" : "light"
  const oldBrightness = dark ? "light" : "dark"

  for (const oldClass of [
    `bg-${oldBrightness}`,
    `navbar-${oldBrightness}`,
    `btn-${oldBrightness}`,
    `border-${oldBrightness}`,
  ]) {
    const newClass = oldClass.replace(oldBrightness, newbrightness)
    for (const element of document.querySelectorAll(`.${oldClass}`)) {
      element.classList.remove(oldClass)
      element.classList.add(newClass)
    }
  }

  for (const oldClass of [`text-${newbrightness}`]) {
    const newClass = oldClass.replace(newbrightness, oldBrightness)
    for (const element of document.querySelectorAll(`.${oldClass}`)) {
      element.classList.remove(oldClass)
      element.classList.add(newClass)
    }
  }
}
