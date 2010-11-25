if(exports) {
  var Handlebars = {};
  Handlebars.Lexer = require("handlebars/jison_ext").Lexer
}

Handlebars.HandlebarsLexer = function() {
  this.state = "CONTENT";
};
Handlebars.HandlebarsLexer.prototype = new Handlebars.Lexer;

Handlebars.HandlebarsLexer.prototype.lex = function() {
  if(this.input === "") return;

  this.setupLex();

  var lookahead = this.peek(2);
  var result = '';

  if(this.state == "MUSTACHE") {
    // chomp optional whitespace
    while(this.peek() === " ") { this.readchar(); }

    if(this.peek(2) === "}}") {
      this.state = "CONTENT"
      this.getchar(2);

      if(this.peek() == "}") this.getchar();
      return "CLOSE";
    } else if(this.peek() === '"') {
      this.readchar();
      while(this.peek() !== '"') { if(this.peek(2) === '\\"') { this.readchar() }; this.getchar() }
      this.readchar();
      return "STRING";
    } else {
      while(this.peek().match(/[A-Za-z]/)) { this.getchar() }
      return "ID"
    }
  } else if(lookahead == "{{") {
    this.state = "MUSTACHE";
    this.getchar(2);

    var peek = this.peek();

    if(peek === ">") {
      this.getchar();
      return "OPEN_PARTIAL";
    } else if(peek === "#") {
      this.getchar();
      return "OPEN_BLOCK";
    } else if(peek === "/") {
      this.getchar();
      return "OPEN_ENDBLOCK";
    } else if(peek === "^") {
      this.getchar();
      return "OPEN_INVERSE"
    } else if(peek === "!") {
      this.readchar();
      this.setupLex(); // reset the lexer state so the yytext is the comment only
      while(this.peek(2) !== "}}") { this.getchar(); };
      this.readchar(2);
      this.state = "CONTENT"
      return "COMMENT";
    } else {
      return "OPEN";
    }
  } else {
    while(this.peek(2) !== "{{" && this.peek(2) !== "") { result = result + this.getchar(); }
    return "CONTENT"
  }
};

if(exports) { exports.Lexer = Handlebars.HandlebarsLexer; }