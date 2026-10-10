// EqyCord contributors, 2026. SPDX-License-Identifier: GPL-3.0-or-later
using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Drawing;
using System.IO;
using System.IO.Compression;
using System.Reflection;
using System.Security.Cryptography;
using System.Threading;
using System.Web.Script.Serialization;
using System.Windows.Forms;

public sealed class PayloadManifest {
    public string Build { get; set; }
    public Dictionary<string, string> Files { get; set; }
}

public static class Payload {
    public static ZipArchive Open() {
        return new ZipArchive(Assembly.GetExecutingAssembly().GetManifestResourceStream("EqyCord.Payload"), ZipArchiveMode.Read);
    }
    public static PayloadManifest Manifest() {
        using (var zip = Open())
        using (var reader = new StreamReader(zip.GetEntry("manifest.json").Open()))
            return new JavaScriptSerializer().Deserialize<PayloadManifest>(reader.ReadToEnd());
    }
    public static string Digest(string path) {
        using (var sha = SHA256.Create())
        using (var input = File.OpenRead(path))
            return BitConverter.ToString(sha.ComputeHash(input)).Replace("-", "").ToLowerInvariant();
    }
    public static void RejectLinks(string path) {
        var directory = new DirectoryInfo(path);
        while (directory != null) {
            if (directory.Exists && (directory.Attributes & FileAttributes.ReparsePoint) != 0)
                throw new IOException("The destination contains a directory link. Choose a normal folder.");
            directory = directory.Parent;
        }
    }
    public static void Extract(string destination) {
        var root = Path.GetFullPath(destination).TrimEnd(Path.DirectorySeparatorChar) + Path.DirectorySeparatorChar;
        RejectLinks(root);
        Directory.CreateDirectory(root);
        var manifest = Manifest();
        using (var zip = Open()) {
            foreach (var entry in zip.Entries) {
                if (entry.FullName == "manifest.json") continue;
                if (!manifest.Files.ContainsKey(entry.FullName)) throw new IOException("Unexpected package file.");
                var target = Path.GetFullPath(Path.Combine(root, entry.FullName.Replace('/', Path.DirectorySeparatorChar)));
                if (!target.StartsWith(root, StringComparison.OrdinalIgnoreCase)) throw new IOException("Unsafe package path.");
                RejectLinks(Path.GetDirectoryName(target));
                if (File.Exists(target)) {
                    if ((File.GetAttributes(target) & FileAttributes.ReparsePoint) != 0) throw new IOException("Destination file is a link.");
                    if (Digest(target) != manifest.Files[entry.FullName]) throw new IOException("Existing EqyCord files have changed. They were not overwritten.");
                    continue;
                }
                Directory.CreateDirectory(Path.GetDirectoryName(target));
                var temporary = target + ".extracting";
                using (var output = new FileStream(temporary, FileMode.CreateNew, FileAccess.Write))
                using (var input = entry.Open()) input.CopyTo(output);
                if (Digest(temporary) != manifest.Files[entry.FullName]) {
                    File.Delete(temporary);
                    throw new IOException("Package checksum verification failed.");
                }
                File.Move(temporary, target);
            }
        }
        foreach (var file in manifest.Files) {
            var target = Path.GetFullPath(Path.Combine(root, file.Key));
            if (!target.StartsWith(root, StringComparison.OrdinalIgnoreCase) || !File.Exists(target) || Digest(target) != file.Value)
                throw new IOException("Package is incomplete or damaged.");
        }
    }
}

public sealed class SetupWindow : Form {
    readonly ComboBox channel = new ComboBox();
    readonly TextBox log = new TextBox();
    readonly Label status = new Label();
    readonly ProgressBar progress = new ProgressBar();
    readonly List<Button> buttons = new List<Button>();
    readonly string dataRoot = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData), "EqyCord");
    readonly PayloadManifest manifest = Payload.Manifest();

    public SetupWindow() {
        Text = "EqyCord Setup";
        ClientSize = new Size(600, 425);
        FormBorderStyle = FormBorderStyle.FixedDialog;
        MaximizeBox = false;
        StartPosition = FormStartPosition.CenterScreen;
        Font = new Font("Segoe UI", 10);
        BackColor = Color.FromArgb(248, 249, 251);
        AddLabel("EqyCord", 24, 18, 550, 45, 24);
        AddLabel("Install your client, verify it, or restore original Discord files.", 26, 70, 548, 24, 10);
        AddLabel("Discord channel", 26, 110, 145, 24, 10);
        channel.SetBounds(181, 107, 210, 30);
        channel.DropDownStyle = ComboBoxStyle.DropDownList;
        channel.Items.AddRange(new object[] { "Stable", "PTB", "Canary" });
        channel.SelectedIndex = 0;
        Controls.Add(channel);
        AddButton("Install", 26, delegate { Run("install"); });
        AddButton("Verify", 209, delegate { Run("verify"); });
        AddButton("Uninstall", 392, delegate { Run("uninstall"); });
        status.SetBounds(26, 202, 548, 27);
        status.Text = "Close the selected Discord client before installing or uninstalling.";
        Controls.Add(status);
        progress.SetBounds(26, 232, 548, 6);
        progress.Visible = false;
        progress.Style = ProgressBarStyle.Marquee;
        Controls.Add(progress);
        log.SetBounds(26, 250, 548, 100);
        log.Multiline = true;
        log.ReadOnly = true;
        log.ScrollBars = ScrollBars.Vertical;
        log.BackColor = Color.White;
        Controls.Add(log);
        var licenses = new LinkLabel { Text = "Licenses and complete source", Left = 26, Top = 360, Width = 280, Height = 24 };
        licenses.LinkClicked += delegate {
            try { var build = BuildPath(); Payload.Extract(build); Process.Start("explorer.exe", Quote(build)); }
            catch (Exception error) { MessageBox.Show(this, error.Message, "EqyCord", MessageBoxButtons.OK, MessageBoxIcon.Error); }
        };
        Controls.Add(licenses);
        AddLabel("Unofficial client mod. May conflict with Discord's Terms. Windows x64.", 26, 392, 548, 24, 9);
    }
    protected override void OnFormClosing(FormClosingEventArgs args) {
        if (progress.Visible) {
            args.Cancel = true;
            status.Text = "Please wait for the current operation to finish.";
        }
        base.OnFormClosing(args);
    }
    void AddLabel(string text, int x, int y, int w, int h, int size) {
        Controls.Add(new Label { Text = text, Left = x, Top = y, Width = w, Height = h, Font = new Font("Segoe UI", size) });
    }
    void AddButton(string text, int x, Action action) {
        var button = new Button { Text = text, Left = x, Top = 154, Width = 170, Height = 38 };
        button.Click += delegate { action(); };
        buttons.Add(button);
        Controls.Add(button);
    }
    string Branch() { return new string[] { "stable", "ptb", "canary" }[channel.SelectedIndex]; }
    string BuildPath() { return Path.Combine(dataRoot, "builds", manifest.Build); }
    public static string Quote(string value) { return "\"" + value.Replace("\"", "\\\"").TrimEnd('\\') + "\""; }

    // Look up ownership in Discord itself, so restore still works after a new
    // setup executable is downloaded or Discord creates a new app directory.
    string OwnedProject(string location, out string appVersion) {
        appVersion = null;
        string project = null;
        if (!Directory.Exists(location)) throw new IOException("Install the selected Discord channel first.");
        foreach (var app in Directory.GetDirectories(location, "app-*")) {
            var state = Path.Combine(app, "resources", ".eqycord-install.json");
            if (!File.Exists(state)) continue;
            Payload.RejectLinks(Path.GetDirectoryName(state));
            var record = new JavaScriptSerializer().Deserialize<Dictionary<string, object>>(File.ReadAllText(state));
            var candidate = Path.GetFullPath((string)record["project"]);
            var allowed = Path.GetFullPath(Path.Combine(dataRoot, "builds")) + Path.DirectorySeparatorChar;
            if (!candidate.StartsWith(allowed, StringComparison.OrdinalIgnoreCase))
                throw new IOException("This EqyCord installation belongs to another package. Use its original uninstaller.");
            if (project != null) throw new IOException("Several owned app versions exist. Restore them with the original installer before continuing.");
            project = candidate;
            appVersion = Path.GetFileName(app);
        }
        return project;
    }
    void Run(string action) {
        string branch = Branch();
        channel.Enabled = false;
        foreach (var button in buttons) button.Enabled = false;
        progress.Visible = true;
        status.Text = "Working…";
        log.Clear();
        ThreadPool.QueueUserWorkItem(delegate {
            string message;
            bool success = false;
            try {
                string folder = new Dictionary<string, string> { { "stable", "Discord" }, { "ptb", "DiscordPTB" }, { "canary", "DiscordCanary" } }[branch];
                string location = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData), folder);
                string version;
                string previous = OwnedProject(location, out version);
                if (action == "install" && previous != null)
                    throw new IOException("EqyCord is already installed. Uninstall that version before installing this build.");
                if (action != "install" && previous == null)
                    throw new IOException("No installation owned by this setup was found. Existing mods were left unchanged.");
                string build = action == "install" ? BuildPath() : previous;
                if (action == "install") Payload.Extract(build);
                Payload.RejectLinks(build);
                var start = new ProcessStartInfo(Path.Combine(build, "runtime", "node.exe"));
                start.Arguments = Quote(Path.Combine(build, "scripts", "eqycord", "installer.mjs")) + " " + action + " --branch " + branch + " --location " + Quote(location);
                if (action != "install") start.Arguments += " --app-version " + version;
                start.UseShellExecute = false;
                start.CreateNoWindow = true;
                start.RedirectStandardOutput = true;
                start.RedirectStandardError = true;
                start.WorkingDirectory = build;
                using (var process = Process.Start(start)) {
                    string errors = "";
                    process.ErrorDataReceived += delegate(object sender, DataReceivedEventArgs args) { if (args.Data != null) errors += args.Data + Environment.NewLine; };
                    process.BeginErrorReadLine();
                    string output = process.StandardOutput.ReadToEnd();
                    process.WaitForExit();
                    if (process.ExitCode != 0) throw new IOException(String.IsNullOrWhiteSpace(errors) ? output : errors);
                }
                success = true;
                message = action == "install" ? "EqyCord installed. Open the selected Discord client.\r\nKeep the files in LocalAppData/EqyCord. You can delete the setup download."
                    : action == "uninstall" ? "Original Discord archive restored and verified. Your settings were preserved."
                    : "Installed EqyCord files and original Discord backup verified.";
            } catch (Exception error) { message = error.Message; }
            if (!IsDisposed) BeginInvoke(new Action(delegate {
                status.Text = success ? "Done" : "Action could not be completed";
                log.Text = message;
                progress.Visible = false;
                channel.Enabled = true;
                foreach (var button in buttons) button.Enabled = true;
            }));
        });
    }
}

public static class Program {
    [STAThread]
    public static int Main(string[] args) {
        try {
            if (args.Length == 2 && args[0] == "--extract-only") {
                Payload.Extract(args[1]);
                return 0;
            }
            bool smoke = args.Length == 1 && args[0] == "--ui-smoke";
            if (args.Length != 0 && !smoke) return 2;
            Application.EnableVisualStyles();
            Application.SetCompatibleTextRenderingDefault(false);
            var window = new SetupWindow();
            if (smoke) {
                window.Opacity = 0;
                window.ShowInTaskbar = false;
                var timer = new System.Windows.Forms.Timer { Interval = 250 };
                window.Shown += delegate { timer.Start(); };
                timer.Tick += delegate { timer.Stop(); window.Close(); };
                window.FormClosed += delegate { timer.Dispose(); };
            }
            Application.Run(window);
            return 0;
        } catch (Exception error) {
            if (args.Length == 0) MessageBox.Show(error.Message, "EqyCord Setup", MessageBoxButtons.OK, MessageBoxIcon.Error);
            return 1;
        }
    }
}
