function voice_say(text) {
  $.get("/voice/say", { text: text });
}
