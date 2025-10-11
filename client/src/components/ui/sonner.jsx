import { useTheme } from "../../hooks/useTheme"
import { Toaster as Sonner } from "sonner"

const Toaster = ({ ...props }) => {
  const { theme } = useTheme()

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
            "group toast group-[.toaster]:bg-white dark:group-[.toaster]:bg-gray-800 group-[.toaster]:text-gray-950 dark:group-[.toaster]:text-gray-50 group-[.toaster]:border-gray-200 dark:group-[.toaster]:border-gray-700 group-[.toaster]:shadow-lg",
          description: "group-[.toast]:text-gray-500 dark:group-[.toast]:text-gray-400",
          actionButton:
            "group-[.toast]:bg-gray-900 dark:group-[.toast]:bg-gray-50 group-[.toast]:text-gray-50 dark:group-[.toast]:text-gray-900",
          cancelButton:
            "group-[.toast]:bg-gray-100 dark:group-[.toast]:bg-gray-800 group-[.toast]:text-gray-500 dark:group-[.toast]:text-gray-400",
          success:
            "group-[.toaster]:bg-white dark:group-[.toaster]:bg-gray-800 group-[.toaster]:text-green-600 dark:group-[.toaster]:text-green-400 group-[.toaster]:border-green-200 dark:group-[.toaster]:border-green-800",
          error:
            "group-[.toaster]:bg-white dark:group-[.toaster]:bg-gray-800 group-[.toaster]:text-red-600 dark:group-[.toaster]:text-red-400 group-[.toaster]:border-red-200 dark:group-[.toaster]:border-red-800",
          warning:
            "group-[.toaster]:bg-white dark:group-[.toaster]:bg-gray-800 group-[.toaster]:text-yellow-600 dark:group-[.toaster]:text-yellow-400 group-[.toaster]:border-yellow-200 dark:group-[.toaster]:border-yellow-800",
          info:
            "group-[.toaster]:bg-white dark:group-[.toaster]:bg-gray-800 group-[.toaster]:text-blue-600 dark:group-[.toaster]:text-blue-400 group-[.toaster]:border-blue-200 dark:group-[.toaster]:border-blue-800",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }

