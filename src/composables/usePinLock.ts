import { ref, computed } from 'vue'
import { pinManager } from '../utils/auth/pinManager'

const showPinModal = ref(false)
const isPinSetup = ref(false)

export function usePinLock() {
  const hasPin = computed(() => pinManager.hasPin())
  const isVerified = computed(() => pinManager.isVerified())
  
  const isLocked = computed(() => {
    return hasPin.value && !isVerified.value
  })

  const requestUnlock = () => {
    if (hasPin.value && !isVerified.value) {
      isPinSetup.value = false
      showPinModal.value = true
    }
  }

  const openPinSetup = () => {
    isPinSetup.value = true
    showPinModal.value = true
  }

  const closePinModal = () => {
    showPinModal.value = false
  }

  const onUnlockSuccess = () => {
    showPinModal.value = false
  }

  return {
    hasPin,
    isVerified,
    isLocked,
    showPinModal,
    isPinSetup,
    requestUnlock,
    openPinSetup,
    closePinModal,
    onUnlockSuccess
  }
}
