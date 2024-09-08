import { AdvancedDynamicTexture, TextBlock, Control } from "@babylonjs/gui/2D";

export class SceneLogger {
    logText: string;
    textBlock: TextBlock;

    constructor() {
        this.logText = '';
        // メッセージボックスにテキストを追加
        const advancedTexture: AdvancedDynamicTexture = AdvancedDynamicTexture.CreateFullscreenUI("UI");
        this.textBlock = new TextBlock();
        this.textBlock.text = "Samples in development. \n";
        this.textBlock.color = "#ff00ff7f";
        this.textBlock.fontSize = 24;
        this.textBlock.textHorizontalAlignment = Control.HORIZONTAL_ALIGNMENT_RIGHT;
        this.textBlock.textVerticalAlignment = Control.VERTICAL_ALIGNMENT_BOTTOM;
        advancedTexture.addControl(this.textBlock);
    }

    log(message: string) {
        this.logText += message + "\n";
        this.textBlock.text = this.logText;
    }
}
