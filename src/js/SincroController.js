import { RTCVoiceChatClient } from "./RTCVoiceChatClient.js";
import { GloriaEye } from "./GloriaEye.js";
import { GloriaChan } from "./GloriaChan.js";
import { ChatMessage } from "./ChatMessage.js";
import { UserMediaManager } from "./UserMediaManager.js";

export class SincroController {
    constructor() {
        this.configrationDialog = document.querySelector("dialog#configurationDialog");

        this.chatBox = document.querySelector("div#obsMessageBox");
        this.chatMessage = new ChatMessage(this.chatBox);
        this.currentMessageID = null;
        this.chatMessage.writeSystemMessage("こんにちは～!");
        this.chatMessage.autoScroll();
        this.gloriaChan = new GloriaChan();

        this.setShortcutKeyEvent();
        this.setConfigurationDialogButtonEvent();
        this.startConfigurationDialog();
        this.setTitleText();
    }

    enableCharacter() {
        if (document.querySelector("input#enableCharacter")?.checked) {
            return true;
        }
        return false;
    }

    enableGloriaEye() {
        if (document.querySelector("input#enableGloriaEye")?.checked) {
            return true;
        }
        return false;
    }

    enableSTUN() {
        if (document.querySelector("input#enableSTUN")?.checked) {
            return true;
        }
        return false;
    }

    getStunServerURL() {
        const urlObj = document.querySelector("input#stunURL");
        if (urlObj && urlObj.value) {
            return urlObj.value;
        }
        return "stun:stun.negix.org:3478";
    }

    startRTC(audioTrack) {
        this.chatMessage.writeSystemMessageText("音声認識・合成システムに接続します。");
        this.rtcc = new RTCVoiceChatClient();
        this.setTextChannelCallback(this.rtcc);
        if (this.enableCharacter()) {
            this.setTelopChannelCallbackWithGloriaChan(this.rtcc);
        } else {
            this.setTelopChannelCallback(this.rtcc);
        }
        this.setConnectionStateChangeCallback(this.rtcc);
        this.rtcc.start(audioTrack, this.enableSTUN(), this.getStunServerURL());
    }

    stopRTC() {
        this.rtcc?.stop();
    }

    setTextChannelCallback(rtcc) {
        rtcc.textChannelCallback = (textEvt) => {
            const data = JSON.parse(textEvt.data);
            console.log(data);
            if (!("resultText" in data && "confirmed" in data)) { return; }
            if (this.currentMessageID) {
                this.chatMessage.updateSystemMessageText(this.currentMessageID, data["resultText"]);
            } else {
                this.currentMessageID = this.chatMessage.writeSystemMessageText(data["resultText"]);
            }
            if (data["confirmed"]) {
                this.currentMessageID = null;
                this.chatMessage.removeOldMessage(10);
            }
        }
    }

    setTelopChannelCallback(rtcc) {
        rtcc.telopChannelCallback = (voiceEvt) => {
            const data = JSON.parse(voiceEvt.data);
            let vowel;
            if (data["vowel"]) {
                vowel = data["vowel"].toUpperCase();
            }
            this.addTelopChar(data["text"]);
        }
    }

    setTelopChannelCallbackWithGloriaChan(rtcc) {
        rtcc.telopChannelCallback = (voiceEvt) => {
            const data = JSON.parse(voiceEvt.data);
            let vowel;
            if (data["vowel"]) {
                vowel = data["vowel"].toUpperCase();
            }
            this.addTelopChar(data["text"]);
            this.gloriaChan.setMouse(vowel, data["length"] * 1000);
        }
    }

    setConnectionStateChangeCallback(rtcc) {
        rtcc.connectionStateChangeCallback = (state) => {
            /* new -> checking -> connected、disconnected -> failed */
            switch (state) {
                case "checking":
                    this.chatMessage.writeSystemMessageText("音声認識・合成システムへの接続を確認しています。");
                    break;
                case "connected":
                    this.chatMessage.writeSystemMessageText("音声認識・合成システムに接続しました。");
                    break;
                case "disconnected":
                    this.chatMessage.writeSystemMessageText("音声認識・合成システムから切断されました。");
                    break;
                case "failed":
                    this.chatMessage.writeSystemMessageText("音声認識・合成システムへの接続に失敗しました。");
                    break;
                default:
                    this.chatMessage.writeSystemMessageText(`Unknown Error - ${state}`);
            }
        }
    }

    startGloriaChan() {
        if (!this.enableCharacter()) { return false; }

        this.gloriaCanvas = document.querySelector("canvas#gloriaCanvas");
        this.gloriaChan.availabilityCheck(() => {
            this.gloriaChan.start(this.gloriaCanvas);
        }, () => {
            this.chatMessage.writeSystemMessageText("今日はお休みのようです...。");
        })
    }

    startGloriaEye(videoTrack) {
        if (!this.enableGloriaEye()) { return false; }

        this.gloriaEyeVideo = document.querySelector('video#gloriaEyeVideo');
        this.gloriaEye = new GloriaEye(this.gloriaEyeVideo);
        this.gloriaEye.initVision();

        const startEye = () => {
            setTimeout(() => {
                if (!this.gloriaEye.modelIsLoaded()) {
                    console.log("Face detector is still loading. wait 1000ms...");
                    startEye();
                } else {
                    console.log("start GloriaEye");
                    const eyeTargetElement = document.querySelector("#eyeTarget");
                    this.gloriaEye.initCamera(videoTrack, (detects) => {
                        document.querySelector("#faceX").textContent = this.gloriaEye.targetX();
                        document.querySelector("#faceY").textContent = this.gloriaEye.targetY();
                        document.querySelector("#facing").textContent = this.gloriaEye.facing();
                        this.gloriaChan.addRigQueue(-this.gloriaEye.targetX() + 0.5, this.gloriaEye.targetY() - 0.5);
                        if (detects.length > 0) {
                            eyeTargetElement.setAttribute("fill", "hsl(300 100% 50% / 50%)");
                            eyeTargetElement.setAttribute("cx", `${this.gloriaEye.targetX() * 100}%`);
                            eyeTargetElement.setAttribute("cy", `${this.gloriaEye.targetY() * 100}%`);
                        } else {
                            eyeTargetElement.setAttribute("fill", "hsl(300 100% 50% / 0%)");
                        }
                    });
                }
            }, 1000);
        }
        startEye();

        this.gloriaEye.arriveCallback = () => {
            document.querySelector('#gloriaEyeStatus').innerText = 'みてる';
            this.rtcc.setMute(false);
        }
        this.gloriaEye.leaveCallback = () => {
            document.querySelector('#gloriaEyeStatus').innerText = 'みてない';
            this.rtcc.setMute(true);
        }
    }

    startConfigurationDialog() {
        this.configrationDialog.addEventListener("keydown", (e) => {
            if (e.key == "Escape") {
                this.closeConfigurationDialog();
            }
        });
        this.configrationDialog.showModal();
    }

    closeConfigurationDialog() {
        this.configrationDialog.close();
    }

    setConfigurationDialogButtonEvent() {
        this.gloriaChan.availabilityCheck(() => {
            // 3Dモデルが利用できる時
            document.querySelector('#enableCharacter').disabled = false;
            document.querySelector('#enableGloriaEye').disabled = false;
        }, () => {
            // 3Dモデルが利用できない時
            document.querySelector('#enableCharacter').disabled = true;
            document.querySelector('#enableCharacter').checked = false;
        });

        document.querySelector("button#rtcStart").onclick = () => {
            this.userMediaManager = new UserMediaManager();
            if (!this.enableGloriaEye()) {
                this.userMediaManager.disableVideo();
            }
            this.userMediaManager.getUserMedia((audioTrack) => {
                this.startRTC(audioTrack);
            }, (videoTrack) => {
                this.startGloriaEye(videoTrack);
            }, (err) => {
                this.chatMessage.writeSystemMessageText(`カメラまたはマイクが見つかりませんでした。 - ${err}`);
            });
            this.startGloriaChan();
            this.closeConfigurationDialog();
        }

        document.querySelector("button#rtcStop").onclick = () => {
            this.stopRTC();
        }

        document.querySelector("input#titleText").oninput = () => {
            this.setTitleText();
        }
    }

    setTitleText() {
        const titleText = document.querySelector("input#titleText").value;
        if (titleText) {
            document.querySelector("div#headerText").innerText = titleText;
        } else {
            /* 空欄の時はデフォルト値を設定 */
            document.querySelector("div#headerText").innerText = "Sincromisor";
        }
    }

    addTelopChar(char) {
        const telopText = document.querySelector("div#obsFooterBox");
        const fontSize = parseFloat(window.getComputedStyle(telopText, null).getPropertyValue("font-size"));
        const maxLength = telopText.clientWidth / fontSize - 1;
        while (telopText.innerText.length > maxLength) {
            telopText.innerText = telopText.innerText.slice(1);
        }
        telopText.innerText += (char || "　");
    }

    /* ctrl + alt + dでデバッグコンソールを表示 */
    setShortcutKeyEvent() {
        const debugConsole = document.querySelector("div#debugConsole");
        window.addEventListener("keydown", (e) => {
            // macOSのChromeではalt+dでkeyの値がδになる
            if (e.ctrlKey && e.altKey && (e.key == 'd' || e.code == 'KeyD')) {
                if (window.getComputedStyle(debugConsole).zIndex == -1) {
                    debugConsole.style.zIndex = 255;
                    debugConsole.style.overflow = 'scroll';
                } else {
                    debugConsole.style.zIndex = -1;
                    debugConsole.style.overflow = 'hidden';
                }
            }
        });
    }

    /* 
        OBS Studioなどで自動的に全てを起動させる時に呼び出される。
        マイク・カメラアクセスの自動許可が必要。
     */
    autoStart() {
        this.startGloriaChan();
        this.startGloriaEye();
        this.startRTC();
        this.closeConfigurationDialog();
    }
}
