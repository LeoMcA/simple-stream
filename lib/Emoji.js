console.log("Emoji graphics CC-BY 4.0 Twitter: https://twemoji.twitter.com/");

twemoji.size = "svg";
twemoji.ext = ".svg";

class Emoji {
  constructor() {
    $("#emoji button").each((_, node) => {
      $(node).append(twemoji.parse($(node).data("emoji")));
    });
    $("#emoji button").click((e) => {
      const emoji = $(e.currentTarget).data("emoji");
      this.render_emoji(emoji);
      if (this.peer) {
        this.peer.send({
          type: "emoji",
          value: emoji,
        });
      }
    });
    $(document).keydown((e) => {
      if (e.which >= 49) {
        const number = e.which - 49;
        const buttons = $("#emoji button");
        if (number < buttons.length) {
          buttons[number].click();
        }
      }
    });
  }

  render_emoji(emoji) {
    const left = $(`button[data-emoji=${emoji}]`).position().left;
    const node = $(`<span>${twemoji.parse(emoji)}</span>`).css("left", left);
    $(".bubbles").append(node);
    setTimeout(() => node.remove(), 5000);
  }
}

export default Emoji;
