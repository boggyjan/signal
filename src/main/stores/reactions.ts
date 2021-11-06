import { observe } from "mobx"
import { resetSelection } from "../actions"
import MIDIOutput from "../services/MIDIOutput"
import RootStore from "./RootStore"

export const registerReactions = (rootStore: RootStore) => {
  // reset selection when tool changed
  observe(rootStore.pianoRollStore, "mouseMode", resetSelection(rootStore))

  observe(
    rootStore.midiDeviceStore,
    "enabledOutputs",
    updateOutputDevices(rootStore)
  )

  observe(
    rootStore.midiDeviceStore,
    "isFactorySoundEnabled",
    updateOutputDevices(rootStore)
  )

  observe(
    rootStore.midiDeviceStore,
    "enabledInputs",
    updateInputDevices(rootStore)
  )

  // reset selection when change track
  observe(rootStore.song, "selectedTrackId", resetSelection(rootStore))

  observe(
    rootStore.services.midiRecorder,
    "isRecording",
    disableSeekWhileRecording(rootStore)
  )

  observe(
    rootStore.services.player,
    "isPlaying",
    stopRecordingWhenStopPlayer(rootStore)
  )
}

type Reaction = (rootStore: RootStore) => () => void

// sync synthGroup.output to enabledOutputIds/isFactorySoundEnabled
const updateOutputDevices: Reaction =
  ({ midiDeviceStore, services: { player, synth, synthGroup } }) =>
  () => {
    player.allSoundsOff()

    const getMIDIDeviceEntries = () =>
      midiDeviceStore.outputs.map((device) => ({
        synth: new MIDIOutput(device),
        isEnabled: midiDeviceStore.enabledOutputs[device.id],
      }))

    synthGroup.outputs = [
      {
        synth: synth,
        isEnabled: midiDeviceStore.isFactorySoundEnabled,
      },
      ...getMIDIDeviceEntries(),
    ]
  }

const updateInputDevices: Reaction =
  ({ midiDeviceStore, services: { midiInput } }) =>
  () => {
    const devices = midiDeviceStore.inputs.filter(
      (d) => midiDeviceStore.enabledInputs[d.id]
    )

    midiInput.removeAllDevices()
    devices.forEach(midiInput.addDevice)
  }

const disableSeekWhileRecording: Reaction =
  ({ services: { player, midiRecorder } }) =>
  () =>
    (player.disableSeek = midiRecorder.isRecording)

const stopRecordingWhenStopPlayer: Reaction =
  ({ services: { player, midiRecorder } }) =>
  () => {
    if (!player.isPlaying) {
      midiRecorder.isRecording = false
    }
  }
