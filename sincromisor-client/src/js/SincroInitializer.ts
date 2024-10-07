import { SincroController } from "./SincroController";
import { DialogManager } from "./UI/DialogManager";
import { ChatMessageManager } from "./UI/ChatMessageManager";
import { CharacterManager } from "./Character/CharacterManager";
import { SincroScene } from "./Scene/SincroScene";
import { TalkManager } from "./RTC/TalkManager";
import { UserMediaManager } from "./RTC/UserMediaManager";

export class SincroInitializer {
    dialogManager: DialogManager;
    chatMessageManager: ChatMessageManager;
    talkManager: TalkManager;
    charCanvas: HTMLCanvasElement;

    constructor() {
        this.dialogManager = DialogManager.getManager();
        this.chatMessageManager = ChatMessageManager.getManager();
        this.talkManager = TalkManager.getManager();
        this.charCanvas = this.getCharCanvas();

        this.getUserMediaAvailabilityCheck();
        this.characterAvailabilityCheck();
        this.setStartButtonEvent();

        if ('obsstudio' in window) {
            this.start();
        }
    }

    private getCharCanvas(): HTMLCanvasElement {
        const charCanvas: HTMLCanvasElement | null = document.querySelector('canvas#characterCanvas') as HTMLCanvasElement | null;
        if (!charCanvas) {
            throw 'canvas#characterCanvas is not found.';
        }
        return charCanvas;
    }

    private getUserMediaAvailabilityCheck(): void {
        if (!UserMediaManager.hasGetUserMedia()) {
            this.dialogManager.updateUserMediaAvailabilityStatus(false);
        }
    }

    private characterAvailabilityCheck(): void {
        CharacterManager.availabilityCheck(() => {
            this.dialogManager.updateCharacterStatus(true);
        }, () => {
            this.dialogManager.updateCharacterStatus(false);
        });
    }

    private setStartButtonEvent(): void {
        this.dialogManager.setRTCStartButtonEventListener(() => {
            this.start();
        });
    }

    private start(): void {
        this.chatMessageManager.writeSystemMessage("こんにちは～!");
        this.chatMessageManager.autoScroll();

        const sincroController: SincroController = new SincroController();
        this.dialogManager.setRTCStopButtonEventListener(() => {
            sincroController.stopRTC();
        });

        if (this.dialogManager.enableCharacter()) {
            const sincroScene: SincroScene = this.initializeSincroScene();
            sincroScene.createScene();
            sincroScene.run();
            if (sincroScene.character) {
                sincroController.setCharacterBone(sincroScene.character?.bones.root);
            }
        }

        this.dialogManager.closeDialog();
    }

    initializeSincroScene(): SincroScene {
        return new SincroScene(
            this.charCanvas, this.talkManager,
            this.dialogManager.enableVR(),
            this.dialogManager.enableCharacter(),
            this.dialogManager.enableInspector()
        );
    }
}
