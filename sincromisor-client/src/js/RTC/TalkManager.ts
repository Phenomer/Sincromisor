import { TelopChannelMessage, TextChannelMessage } from "./RTCMessage";

export interface CurrentMora {
    'moraID': number,
    'mora': TelopChannelMessage,
    'msec': number,
    'endTime': number
}

export class TalkManager {
    telopChannelMessage: Array<TelopChannelMessage> = [];
    textChannelMessage: Array<TextChannelMessage> = [];
    confirmedText: { 'startAt': number, 'text': string }[] = []
    currentTelopChannelMessage: CurrentMora | null = null;
    mora_id: number = 0;

    constructor() {
    }

    addTextChannelMessage(msg: TextChannelMessage): void {
        this.textChannelMessage.push(msg);
        if (msg.confirmed) {
            this.confirmedText.push({
                'startAt': msg.start_at,
                'text': msg.resultText
            });
        }
    }

    addTelopChannelMessage(msg: TelopChannelMessage): void {
        this.telopChannelMessage.push(msg);
        if (msg.new_text) {
            console.log(msg.new_text);
            this.currentTelopChannelMessage = {
                'moraID': this.mora_id,
                'mora': msg,
                'msec': msg.length * 1000,
                'endTime': performance.now() + msg.length * 1000
            };
            this.mora_id += 1;
        }
    }

    currentMora(): CurrentMora | null {
        if (!this.currentTelopChannelMessage) {
            return null;
        }
        if (this.currentTelopChannelMessage.endTime < performance.now()) {
            this.currentTelopChannelMessage = null;
            return null;
        }
        return this.currentTelopChannelMessage;
    }

    currentText(): string {
        return this.textChannelMessage[this.textChannelMessage.length - 1]['resultText'];
    }
}

/*
    {"session_id": "01J6TV07AMY0WCJTEVWMZXBTXP", "speech_id": 0, "sequence_id": 1, "start_at": 1725330115.214178, "confirmed": false, "recognizedResult": [["今日", 0.72412109375], ["。", 0.9111328125], ["</s>", 1.0]], "resultText": "今日。"}
    {"session_id": "01J6TV07AMY0WCJTEVWMZXBTXP", "speech_id": 0, "sequence_id": 2, "start_at": 1725330115.633875, "confirmed": false, "recognizedResult": [["今日", 0.95654296875], ["は", 0.9990234375], ["加賀", 0.2113037109375], ["。", 0.97802734375], ["</s>", 1.0]], "resultText": "今日は加賀。"}
    {"session_id": "01J6TV07AMY0WCJTEVWMZXBTXP", "speech_id": 0, "sequence_id": 3, "start_at": 1725330116.3743184, "confirmed": false, "recognizedResult": [["今日", 0.93115234375], ["は", 0.99853515625], ["9", 0.99951171875], ["月", 1.0], ["3", 0.9990234375], ["日", 1.0], ["です", 1.0], ["。", 0.998046875], ["</s>", 1.0]], "resultText": "今日は9月3日です。"}
    {"session_id": "01J6TV07AMY0WCJTEVWMZXBTXP", "speech_id": 0, "sequence_id": 4, "start_at": 1725330116.3743184, "confirmed": true, "recognizedResult": [["今日", 0.888671875], ["は", 0.998046875], ["9", 0.9990234375], ["月", 1.0], ["3", 0.9990234375], ["日", 1.0], ["です", 1.0], ["。", 1.0], ["</s>", 1.0]], "resultText": "今日は9月3日です。"}
    {"timestamp": 0.0, "message": "今日は", "vowel": null, "text": null, "length": 0.1, "new_text": true}
    {"timestamp": 0.1, "message": "今日は", "vowel": "o", "text": "キョ", "length": 0.19575100392103195, "new_text": true}
    {"timestamp": 0.3, "message": "今日は", "vowel": "o", "text": "オ", "length": 0.088856041431427, "new_text": true}
    {"timestamp": 0.4000000000000001, "message": "今日は", "vowel": "a", "text": "ワ", "length": 0.20088905841112137, "new_text": true}
    {"timestamp": 0.0, "message": "9月3日です。", "vowel": null, "text": null, "length": 0.1, "new_text": true}
    {"timestamp": 0.1, "message": "9月3日です。", "vowel": "u", "text": "ク", "length": 0.12869085371494293, "new_text": true}
    {"timestamp": 0.23999999999999996, "message": "9月3日です。", "vowel": "a", "text": "ガ", "length": 0.1680881530046463, "new_text": true}
    {"timestamp": 0.4000000000000001, "message": "9月3日です。", "vowel": "u", "text": "ツ", "length": 0.12010888755321503, "new_text": true}
    {"timestamp": 0.5200000000000001, "message": "9月3日です。", "vowel": "i", "text": "ミ", "length": 0.14170382171869278, "new_text": true}
    {"timestamp": 0.6600000000000003, "message": "9月3日です。", "vowel": "cl", "text": "ッ", "length": 0.06285825371742249, "new_text": true}
    {"timestamp": 0.7400000000000003, "message": "9月3日です。", "vowel": "a", "text": "カ", "length": 0.11659930646419525, "new_text": true}
    {"timestamp": 0.8400000000000004, "message": "9月3日です。", "vowel": "e", "text": "デ", "length": 0.1379501298069954, "new_text": true}
    {"timestamp": 0.9800000000000005, "message": "9月3日です。", "vowel": "U", "text": "ス", "length": 0.18402959406375885, "new_text": true}
 */