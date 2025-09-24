export const useSidebar = () => {
  const isOpen = useState('sidebar.isOpen', () => false)
  
  const toggle = () => {
    isOpen.value = !isOpen.value
  }
  
  const open = () => {
    isOpen.value = true
  }
  
  const close = () => {
    isOpen.value = false
  }
  
  return {
    isOpen: readonly(isOpen),
    toggle,
    open,
    close
  }
}