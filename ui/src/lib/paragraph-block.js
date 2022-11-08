import Paragraph from '@editorjs/paragraph';

const ParagraphTool = (function (original) {
    function Paragraph() {
      original.apply(this, arguments) 
      this.validate = function (savedData) {
        // if (savedData.text.trim() === "" && !this._preserveBlank) {
        //   return false
        // }
  
        return true
      }
    }
    Paragraph.prototype = original.prototype 
    Paragraph.prototype.constructor = Paragraph 
    return Paragraph
  })(Paragraph)

export default ParagraphTool;