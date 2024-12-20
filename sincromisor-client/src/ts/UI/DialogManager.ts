export class DialogManager {
    private static instance: DialogManager

    static getManager(): DialogManager {
        if (!DialogManager.instance) {
            DialogManager.instance = new DialogManager();
        }
        return DialogManager.instance;
    }

    private constructor() {
        this.setMiscEvent();
        this.updateTitleText();
        this.showDialog();
    }

    showDialog(): void {
        const dialog = this.getDialogElement()
        dialog.addEventListener("keydown", (e) => {
            if (e.key == "Escape") {
                this.closeDialog();
            }
        });
        dialog.showModal();
    }

    closeDialog(): void {
        this.getDialogElement().close();
    }

    private getDialogElement(): HTMLDialogElement {
        const e: HTMLDialogElement | null = document.querySelector('dialog#configurationDialog');
        if (e == null) {
            throw 'dialog#configurationDialog is not found.'
        }
        return e;
    }

    talkMode(): string {
        const eC: HTMLSelectElement | null = document.querySelector('select#talkModeSelector');
        if (eC == null) { return 'chat'; }
        return eC?.value;
    }

    enableCharacter(): boolean {
        const eC: HTMLInputElement | null = document.querySelector('input#enableCharacter');
        if (eC == null) { return false; }
        return eC.checked;
    }

    enableTalk(): boolean {
        const eC: HTMLInputElement | null = document.querySelector('input#enableTalk');
        if (eC == null) { return false; }
        return eC.checked;
    }

    enableCharacterGaze(): boolean {
        const eC: HTMLInputElement | null = document.querySelector("input#enableCharacterGaze");
        if (eC == null) { return false; }
        if (eC.checked) {
            return true;
        }
        return false;
    }

    enableAutoMute(): boolean {
        const eC: HTMLInputElement | null = document.querySelector('input#enableAutoMute');
        if (eC == null) { return false; }
        return eC.checked;
    }

    enableInspector(): boolean {
        const eC: HTMLInputElement | null = document.querySelector('input#enableInspector');
        if (eC == null) { return false; }
        return eC.checked;
    }

    enableVR(): boolean {
        const eC: HTMLInputElement | null = document.querySelector('input#enableVR');
        if (eC == null) { return false; }
        return eC.checked;
    }

    private getTitleText(): string {
        const titleInputElement: HTMLInputElement | null = document.querySelector("input#titleText");
        if (titleInputElement && titleInputElement.value) {
            return titleInputElement.value;
        }
        return "Sincromisor";
    }

    updateTitleText(): void {
        const headerElement: HTMLDivElement | null = document.querySelector("div#sincroHeaderBox__text");
        if (!headerElement) {
            return;
        }
        headerElement.innerText = this.getTitleText();
    }

    updateCharacterStatus(available: boolean): void {
        this.updateEnableCharacterStatus(available);
        this.updateEnableCharacterGazeStatus(available);
        this.updateAutoMuteStatus();
    }

    updateUserMediaAvailabilityStatus(available: boolean): void {
        const eC: HTMLButtonElement | null = document.querySelector('button#sincroStart');
        if (!eC) {
            return;
        }
        if (available) {
            eC.disabled = false;
            eC.textContent = 'はじめる';
            this.updateEnableCharacterGazeStatus(true);
            this.updateAutoMuteStatus();
        } else {
            eC.disabled = true;
            eC.textContent = 'マイクが利用できません';
            this.updateEnableCharacterGazeStatus(false);
            this.updateAutoMuteStatus();
        }
    }

    private updateEnableCharacterStatus(available: boolean) {
        const eC: HTMLInputElement | null = document.querySelector('#enableCharacter');
        if (!eC) {
            return;
        }
        if (available) {
            eC.disabled = false;
        } else {
            eC.disabled = true;
            eC.checked = false;
        }
    }

    updateEnableCharacterGazeStatus(available: boolean): void {
        const eC: HTMLInputElement | null = document.querySelector('#enableCharacterGaze');
        if (!eC) {
            return;
        }
        if (available) {
            eC.disabled = false;
        } else {
            eC.disabled = true;
            eC.checked = false;
        }
    }

    updateAutoMuteStatus(): void {
        const eInput: HTMLInputElement | null = document.querySelector('input#enableAutoMute');
        if (!eInput) {
            return;
        }
        if (this.enableCharacterGaze()) {
            eInput.disabled = false;
        } else {
            eInput.disabled = true;
            eInput.checked = false;

        }
    }

    setRTCStartButtonEventListener(startFunction: () => void): void {
        const startBtn: HTMLButtonElement | null = document.querySelector('button#sincroStart');
        if (!startBtn) {
            throw 'button#sincroStart is not found.';
        }
        startBtn.addEventListener('click', startFunction);
    }

    setRTCStopButtonEventListener(stopFunction: () => void): void {
        const startBtn: HTMLButtonElement | null = document.querySelector('button#rtcStop');
        if (!startBtn) {
            throw 'button#sincroStart is not found.';
        }
        startBtn.addEventListener('click', stopFunction);
    }

    private setMiscEvent(): void {
        // 入力されたタイトルに合わせたヘッダの更新
        const titleText: HTMLInputElement | null = document.querySelector("input#titleText");
        if (titleText) {
            titleText.oninput = () => {
                this.updateTitleText();
            }
        }

        // 顔認識の有効/無効化設定と自動ミュート設定の同期
        const enablecharacterGazeBox: HTMLInputElement | null = document.querySelector("input#enableCharacterGaze");
        if (enablecharacterGazeBox) {
            enablecharacterGazeBox.onclick = () => {
                this.updateAutoMuteStatus();
            }
        }
    }
}
