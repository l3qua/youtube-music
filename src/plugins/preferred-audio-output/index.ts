import { createPlugin } from '@/utils'

export default createPlugin({
  name: 'Preferred Audio Output',
  description: 'Lets you choose a preferred audio output device for playback.',
  config: {
    deviceId: ''
  },
  menu: async ({ getConfig, setConfig }) => {
    const { deviceId } = await getConfig()
    const devices = await navigator.mediaDevices.enumerateDevices()
    const outputs = devices.filter(d => d.kind === 'audiooutput')

    return [
      {
        label: 'Preferred Audio Output Device',
        submenu: outputs.map(d => ({
          label: d.label || d.deviceId,
          type: 'radio',
          checked: d.deviceId === deviceId,
          click: () => setConfig({ deviceId: d.deviceId })
        }))
      }
    ]
  },
  renderer: {
    async onPlayerApiReady(api, ctx) {
      const { deviceId } = await ctx.getConfig()
      await trySetAudioOutput(deviceId)

      navigator.mediaDevices.ondevicechange = async () => {
        const { deviceId } = await ctx.getConfig()
        await trySetAudioOutput(deviceId)
      }
    },
    async onConfigChange(config) {
      await trySetAudioOutput(config.deviceId)
    }
  }
})

async function trySetAudioOutput(deviceId: string): Promise<void> {
  if (!deviceId) return

  const video = document.querySelector<HTMLMediaElement>('.html5-main-video, .video-stream')
  if (!video || typeof (video as any).setSinkId !== 'function') return

  try {
    if ((video as any).sinkId !== deviceId) {
      await (video as any).setSinkId(deviceId)
      console.log('[Preferred Audio Output] Set audio sink to:', deviceId)
    }
  } catch (err) {
    console.error('[Preferred Audio Output] Failed to set sinkId:', err)
  }
}
