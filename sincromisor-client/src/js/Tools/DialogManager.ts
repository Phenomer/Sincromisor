export class DialogManager {
    constructor() {
        this.setMiscEvent();
        this.updateTitleText();
        this.setShortcutKeyEvent();
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

    enableGloriaEye() {
        const eC: HTMLInputElement | null = document.querySelector("input#enableGloriaEye");
        if (eC?.checked) {
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

    enableSTUN(): boolean {
        const eC: HTMLInputElement | null = document.querySelector('input#enableSTUN');
        if (eC == null) { return false; }
        return eC.checked;
    }

    getStunServerURL(): string {
        const urlObj: HTMLInputElement | null = document.querySelector("input#stunURL");
        if (urlObj && urlObj.value) {
            return urlObj.value;
        }
        return "stun:stun.negix.org:3478";
    }

    private getTitleText(): string {
        const titleInputElement: HTMLInputElement | null = document.querySelector("input#titleText");
        if (titleInputElement && titleInputElement.value) {
            return titleInputElement.value;
        }
        return "Sincromisor";
    }

    updateTitleText(): void {
        const headerElement: HTMLDivElement | null = document.querySelector("div#headerText");
        if (!headerElement) {
            return;
        }
        headerElement.innerText = this.getTitleText();
    }

    updateCharacterStatus(available: boolean) {
        this.updateEnableCharacterStatus(available);
        this.updateEnableGloriaEyeStatus(available);
        this.updateAutoMuteStatus();
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

    private updateEnableGloriaEyeStatus(available: boolean) {
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

    private updateAutoMuteStatus() {
        const eInput: HTMLInputElement | null = document.querySelector('input#enableAutoMute');
        if (!eInput) {
            return;
        }
        if (this.enableGloriaEye()) {
            eInput.disabled = false;
        } else {
            eInput.disabled = true;
            eInput.checked = false;

        }
    }

    setRTCStartButtonEventListener(startFunction: () => void) {
        const startBtn: HTMLButtonElement | null = document.querySelector('button#rtcStart');
        if (!startBtn) {
            throw 'button#rtcStart is not found.';
        }
        startBtn.addEventListener('click', startFunction);
    }

    setRTCStopButtonEventListener(stopFunction: () => void) {
        const startBtn: HTMLButtonElement | null = document.querySelector('button#rtcStop');
        if (!startBtn) {
            throw 'button#rtcStart is not found.';
        }
        startBtn.addEventListener('click', stopFunction);
    }

    private setMiscEvent() {
        // 入力されたタイトルに合わせたヘッダの更新
        const titleText: HTMLInputElement | null = document.querySelector("input#titleText");
        if (titleText) {
            titleText.oninput = () => {
                this.updateTitleText();
            }
        }

        // 顔認識の有効/無効化設定と自動ミュート設定の同期
        const enableGloriaEyeBox: HTMLInputElement | null = document.querySelector("input#enableGloriaEye");
        if (enableGloriaEyeBox) {
            enableGloriaEyeBox.onclick = () => {
                this.updateAutoMuteStatus();
            }
        }
    }

    /* ctrl + alt + dでデバッグコンソールを表示 */
    private setShortcutKeyEvent(): void {
        const debugConsole: HTMLDivElement | null = document.querySelector("div#debugConsole");
        if (!debugConsole) {
            return;
        }
        window.addEventListener("keydown", (e) => {
            // macOSのChromeではalt+dでkeyの値がδになる
            if (e.ctrlKey && e.altKey && (e.key == 'd' || e.code == 'KeyD')) {
                if (window.getComputedStyle(debugConsole).zIndex == '-1') {
                    debugConsole.style.zIndex = '255';
                    debugConsole.style.overflow = 'scroll';
                } else {
                    debugConsole.style.zIndex = '-1';
                    debugConsole.style.overflow = 'hidden';
                }
            }
        });
    }
}