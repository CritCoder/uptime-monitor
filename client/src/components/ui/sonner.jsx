import { useTheme } from "../../hooks/useTheme"
import { Toaster as Sonner } from "sonner"

const Toaster = ({ ...props }) => {
  const { theme = "light" } = useTheme()

  return (
    <Sonner
      theme={theme}
      className="toaster group"
      position="bottom-center"
      expand={false}
      richColors
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-white group-[.toaster]:text-gray-950 group-[.toaster]:border-gray-200 group-[.toaster]:shadow-lg",
          description: "group-[.toast]:text-gray-500",
          actionButton:
            "group-[.toast]:bg-gray-900 group-[.toast]:text-gray-50",
          cancelButton:
            "group-[.toast]:bg-gray-100 group-[.toast]:text-gray-500",
          success:
            "group-[.toaster]:bg-white group-[.toaster]:text-green-600 group-[.toaster]:border-green-200",
          error:
            "group-[.toaster]:bg-white group-[.toaster]:text-red-600 group-[.toaster]:border-red-200",
          warning:
            "group-[.toaster]:bg-white group-[.toaster]:text-yellow-600 group-[.toaster]:border-yellow-200",
          info:
            "group-[.toaster]:bg-white group-[.toaster]:text-blue-600 group-[.toaster]:border-blue-200",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }

