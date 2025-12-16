// Standard footer signature used across console.log(ic) projects

export default function Footer() {
  return (
    <footer className="border-t border-slate-300 dark:border-slate-800 py-6">
      <div className="mx-auto max-w-3xl p-6">
        <p className="text-xs text-center text-slate-500 dark:text-slate-400">
          Crafted by{" "}
          <a
            href="https://consolelogic.net"
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-slate-600 dark:text-slate-300 hover:underline transition-all duration-150"
          >
            console.log(ic)
          </a>
        </p>
      </div>
    </footer>
  )
}

