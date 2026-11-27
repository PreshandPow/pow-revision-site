import React from 'react';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';
import toast from 'react-hot-toast';

export function SpeechToText() {
    const {
        transcript,
        listening,
        resetTranscriptwwwwwwwwwwwwwwww,
        browserSupportsSpeechRecognition
    } = useSpeechRecognition()

    if (!browserSupportsSpeechRecognition) {
        toast.error('Browser does not support speech recognition!')
        return;
    }


    toast.success('Microphone is on');

    return { transcript, listening };
}