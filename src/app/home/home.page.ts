import { Component } from '@angular/core';
import { Directory, Filesystem } from '@capacitor/filesystem';
import { Haptics } from '@capacitor/haptics';
import { NativeAudio } from '@capgo/native-audio';
import { GenericResponse, RecordingData, VoiceRecorder } from 'capacitor-voice-recorder';
import { v4 as uuidv4 } from 'uuid';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {
  public isRecording: boolean = false;
  public recordingFinished: boolean = false;
  public recordingPath: string = '';

  constructor() {}

  // Starts the recording
  public startRecording() {
    VoiceRecorder.requestAudioRecordingPermission().then((result: GenericResponse) => {
      if(!result.value) {
        Haptics.vibrate();
      } else {
        VoiceRecorder.startRecording().then((res: GenericResponse) => {
          if(res.value) this.isRecording = true;
        })
      }
    });
  }

  // Starts the recording
  public stopRecording() {
    if(this.isRecording) {
      VoiceRecorder.stopRecording().then(async (res: RecordingData) => {
        this.isRecording = false;
        this.recordingFinished = true;

        if (res.value && res.value.recordDataBase64) {
          const base64Audio = `data:audio/aac;base64,${res.value.recordDataBase64}`

          const fileRes = await Filesystem.writeFile({
            path: `${uuidv4()}`,
            data: base64Audio,
            directory: Directory.Data
          });

          this.recordingPath = fileRes.uri;
        } else {
          this.isRecording = false;
          this.recordingFinished = false;
        }
      });
    }
  }

  // Play the sound from path
  public async playSound() {
    await NativeAudio.unload({ assetId: 'audio-recording' })

    await NativeAudio.preload({
      assetId: 'audio-recording',
      assetPath: this.recordingPath,
      volume: 1,
      isUrl: true
    });

    setTimeout(async () => {
      await NativeAudio.play({
        assetId: 'audio-recording'
      });
    }, 1000)
  }

  // Clear everything
  public clear() {
    this.isRecording = false;
    this.recordingFinished = false;
    this.recordingPath = '';
  }
}
