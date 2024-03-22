import { commands } from "../../types/common";

import { destDir, tempDIR, platform } from "./globals";

export const generalCommands = (
  owner: string,
  repo: string,
  branch: string,
  codeQLLanguage: string,
  baseURL: string,
): commands => {

  const commands = [
    // Clean the workspace
    {
      command: platform === "win32" ? "rmdir" : "rm",
      args: [
        ...(platform === "win32" ? ["/Q", "/S"] : ["-rf"]),
        winSeparator(`./${tempDIR}`, platform),
      ],
      cwd: `/${destDir}/`,
    },
    {
      command: "mkdir",
      args: [`${tempDIR}`],
      cwd: `/${destDir}`,
    },
    {
      command: "git",
      args: [
        ...(platform === "darwin"
          ? ["clone", "--depth", "1", "--filter=blob:none", "--sparse"]
          : ["clone"]),
        `${baseURL}/${owner}/${repo}.git`,
      ],
      cwd: `/${destDir}/${tempDIR}`,
    },
    {
      command: "git",
      args: ["checkout", "-b", `${branch}`],
      cwd: `/${destDir}/${tempDIR}/${repo}`,
    },
    {
      command: "mkdir",
      args: [
        ...(platform === "win32" ? [] : ["-p"]),
        [winSeparator(".github/workflows", platform)],
      ],
      cwd: `/${destDir}/${tempDIR}/${repo}`,
    },
    {
      command: platform === "win32" ? "copy" : "cp",
      args: [
        winSeparator(`./bin/workflows/*codeql-${codeQLLanguage}*.yml`, platform),
        winSeparator(
          `/${destDir}/${tempDIR}/${repo}/.github/workflows/`,
          platform,
        ),
      ],
      cwd: process.cwd(),
    },
    {
      command: "git",
      args: [
        ...(platform === "darwin" ? ["add", "--sparse"] : ["add"]),
        winSeparator(".github/workflows/*", platform),
      ],
      cwd: `/${destDir}/${tempDIR}/${repo}`,
    },
    {
      command: "git",
      args: ["commit", "-m", '"Commit CodeQL Files"'],
      cwd: `/${destDir}/${tempDIR}/${repo}`,
    },
    {
      command: "git",
      args: ["push", "--set-upstream", "origin", `${branch}`],
      cwd: `/${destDir}/${tempDIR}/${repo}`,
    },
    {
      command: platform === "win32" ? "rmdir" : "rm",
      args: [
        ...(platform === "win32" ? ["/Q", "/S"] : ["-rf"]),
        winSeparator(`./${tempDIR}/`, platform),
      ],
      cwd: `/${destDir}/`,
    },
  ] as commands;
  return commands;
};

/**
 * Helper function to convert linux path separator to windows path separator.
 *
 * @param text     The string path to convert separators on
 * @param platform The string platform type. ex: win32, darwin, linux, etc
 * @returns        The string platform specifically formatted path
 */
function winSeparator(text: string, platform: string): string {
  return platform === "win32" ? text.replaceAll("/", "\\") : text;
}
