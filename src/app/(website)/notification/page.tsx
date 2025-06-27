import Notification from "@/components/Notification/Notification"
import { SocketProvider } from "@/providers/SocketProvider"

const page = () => {
  return (
    <>
      <SocketProvider>
        <Notification />
      </SocketProvider>
    </>
  )
}

export default page