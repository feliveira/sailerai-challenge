import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { mount } from "@vue/test-utils";
import { nextTick } from "vue";
import MessageComponent from "../../../components/chat/ChatWindow/ChatMessage.vue";
import type { Message } from "@/types/chat";
import { Play, Pause, Loader2 } from "lucide-vue-next";

// Mock audio element
const mockAudio = {
  play: vi.fn().mockResolvedValue(undefined),
  pause: vi.fn(),
  currentTime: 0,
  duration: 120,
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
  dispatchEvent: vi.fn(),
};

// Mock HTMLAudioElement
Object.defineProperty(window, "HTMLAudioElement", {
  writable: true,
  value: vi.fn().mockImplementation(() => mockAudio),
});

describe("MessageComponent", () => {
  let wrapper: any;

  const createMessage = (overrides: Partial<Message> = {}): Message => ({
    id: "1",
    type: "text",
    content: "Test message",
    user_id: "customer_1",
    timestamp: "2024-01-15T14:30:00Z",
    time: "14:30",
    isoTime: "2024-01-15T14:30:00Z",
    fullTime: "15 de janeiro de 2024, 14:30:00",
    ...overrides,
  });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    if (wrapper) {
      wrapper.unmount();
    }
  });

  describe("Message Type Detection", () => {
    it("should detect text message type", () => {
      const message = createMessage({ content: "Hello world" });
      wrapper = mount(MessageComponent, { props: { message } });

      expect(
        wrapper.find('[data-testid="text-message"]').exists() ||
          wrapper.text().includes("Hello world")
      ).toBe(true);
    });

    it("should detect audio message type", async () => {
      const message = createMessage({
        content: "https://example.com/audio.mp3",
      });
      wrapper = mount(MessageComponent, { props: { message } });

      await nextTick();
      expect(wrapper.find("audio").exists()).toBe(true);
      expect(wrapper.find("button").exists()).toBe(true); // play button
    });

    it("should detect audio with different extensions", () => {
      const extensions = ["mp3", "wav", "ogg", "m4a", "aac"];

      extensions.forEach((ext) => {
        const message = createMessage({
          content: `https://example.com/audio.${ext}`,
        });
        wrapper = mount(MessageComponent, { props: { message } });

        expect(wrapper.find("audio").exists()).toBe(true);
        wrapper.unmount();
      });
    });

    it("should detect URL message type", () => {
      const message = createMessage({ content: "https://example.com" });
      wrapper = mount(MessageComponent, { props: { message } });

      expect(wrapper.find('a[target="_blank"]').exists()).toBe(true);
      expect(wrapper.text()).toContain("Abrir link");
    });
  });

  describe("User Type Detection and Styling", () => {
    it("should identify agent messages and apply correct styles", () => {
      const message = createMessage({ user_id: "agent_123" });
      wrapper = mount(MessageComponent, { props: { message } });

      const messageDiv = wrapper.find(".max-w-xs");
      expect(messageDiv.classes()).toContain("bg-green-600");
      expect(messageDiv.classes()).toContain("text-white");
      expect(wrapper.find(".flex").classes()).toContain("justify-end");
    });

    it("should identify bot messages and apply correct styles", () => {
      const message = createMessage({ user_id: "bot_123" });
      wrapper = mount(MessageComponent, { props: { message } });

      const messageDiv = wrapper.find(".max-w-xs");
      expect(messageDiv.classes()).toContain("bg-blue-600");
      expect(messageDiv.classes()).toContain("text-white");
    });

    it("should identify customer messages and apply correct styles", () => {
      const message = createMessage({ user_id: "customer_123" });
      wrapper = mount(MessageComponent, { props: { message } });

      const messageDiv = wrapper.find(".max-w-xs");
      expect(messageDiv.classes()).toContain("bg-white");
      expect(messageDiv.classes()).toContain("text-gray-800");
      expect(messageDiv.classes()).toContain("border-gray-200");
    });

    it("should show correct sender labels", () => {
      const cases = [
        { user_id: "agent_123", expected: "agente" },
        { user_id: "bot_456", expected: "assistente" },
        { user_id: "customer_789", expected: "usuário" },
        { user_id: "unknown_type", expected: "desconhecido" },
      ];

      cases.forEach(({ user_id, expected }) => {
        const message = createMessage({ user_id });
        wrapper = mount(MessageComponent, { props: { message } });

        const ariaLabel = wrapper
          .find('[role="article"]')
          .attributes("aria-label");
        expect(ariaLabel).toContain(expected);
        wrapper.unmount();
      });
    });
  });

  describe("Audio Functionality", () => {
    let audioMessage: Message;

    beforeEach(() => {
      audioMessage = createMessage({ content: "https://example.com/test.mp3" });
      wrapper = mount(MessageComponent, { props: { message: audioMessage } });
    });

    it("should toggle audio playback", async () => {
      const playButton = wrapper.find("button");
      const audio = wrapper.find("audio").element;

      // Mock audio methods
      audio.play = vi.fn().mockResolvedValue(undefined);
      audio.pause = vi.fn();

      // Click play
      await playButton.trigger("click");
      await nextTick();

      expect(audio.play).toHaveBeenCalled();

      // Click pause
      await playButton.trigger("click");
      await nextTick();

      expect(audio.pause).toHaveBeenCalled();
    });

    it("should show loading state", async () => {
      // Simulate loading state
      wrapper.vm.isLoading = true;
      await nextTick();

      const button = wrapper.find("button");
      expect(button.attributes("disabled")).toBeDefined();
      expect(wrapper.find(".animate-spin").exists()).toBe(true);
    });

    it("should show Play/Pause icons correctly", async () => {
      // Initially should show Play icon (not loading, not playing)
      expect(wrapper.findComponent(Play).exists()).toBe(true);
      expect(wrapper.findComponent(Pause).exists()).toBe(false);
      expect(wrapper.findComponent(Loader2).exists()).toBe(false);

      // Set playing state
      wrapper.vm.isPlaying = true;
      await nextTick();

      // Should now show Pause icon
      expect(wrapper.findComponent(Pause).exists()).toBe(true);
      expect(wrapper.findComponent(Play).exists()).toBe(false);
      expect(wrapper.findComponent(Loader2).exists()).toBe(false);

      // Set loading state
      wrapper.vm.isLoading = true;
      await nextTick();

      // Should show Loader2 icon
      expect(wrapper.findComponent(Loader2).exists()).toBe(true);
      expect(wrapper.findComponent(Play).exists()).toBe(false);
      expect(wrapper.findComponent(Pause).exists()).toBe(false);
    });

    it("should format time correctly", () => {
      expect(wrapper.vm.formatTime(0)).toBe("0:00");
      expect(wrapper.vm.formatTime(65)).toBe("1:05");
      expect(wrapper.vm.formatTime(3661)).toBe("61:01");
      expect(wrapper.vm.formatTime(NaN)).toBe("0:00");
      expect(wrapper.vm.formatTime(Infinity)).toBe("0:00");
    });

    it("should handle audio events", async () => {
      const audio = wrapper.find("audio").element;

      // Simulate loadedmetadata event
      wrapper.vm.duration = 0;
      wrapper.vm.onAudioLoaded();
      expect(wrapper.vm.isLoading).toBe(false);

      // Simulate timeupdate event
      audio.currentTime = 30;
      wrapper.vm.onTimeUpdate();
      expect(wrapper.vm.currentTime).toBe(30);

      // Simulate ended event
      wrapper.vm.isPlaying = true;
      wrapper.vm.currentTime = 120;
      wrapper.vm.onAudioEnded();
      expect(wrapper.vm.isPlaying).toBe(false);
      expect(wrapper.vm.currentTime).toBe(0);
    });
  });

  describe("Time Display", () => {
    it("should display message time correctly", () => {
      const message = createMessage({
        time: "14:30",
        isoTime: "2024-01-15T14:30:00Z",
        fullTime: "15 de janeiro de 2024, 14:30:00",
      });
      wrapper = mount(MessageComponent, { props: { message } });

      const timeElement = wrapper.find("time");
      expect(timeElement.text()).toBe("14:30");
      expect(timeElement.attributes("datetime")).toBe("2024-01-15T14:30:00Z");
      expect(timeElement.attributes("title")).toBe(
        "15 de janeiro de 2024, 14:30:00"
      );
    });

    it("should apply correct time styling for different user types", () => {
      const cases = [
        { user_id: "agent_123", expectedClass: "text-green-100" },
        { user_id: "bot_456", expectedClass: "text-blue-100" },
        { user_id: "customer_789", expectedClass: "text-gray-500" },
      ];

      cases.forEach(({ user_id, expectedClass }) => {
        const message = createMessage({ user_id });
        wrapper = mount(MessageComponent, { props: { message } });

        const timeElement = wrapper.find("time");
        expect(timeElement.classes()).toContain(expectedClass);
        wrapper.unmount();
      });
    });
  });

  describe("URL Messages", () => {
    it("should render URL with link", () => {
      const message = createMessage({ content: "https://example.com/page" });
      wrapper = mount(MessageComponent, { props: { message } });

      const link = wrapper.find('a[target="_blank"]');
      expect(link.exists()).toBe(true);
      expect(link.attributes("href")).toBe("https://example.com/page");
      expect(link.attributes("rel")).toBe("noopener noreferrer");
      expect(link.text()).toBe("Abrir link");
    });
  });

  describe("Accessibility", () => {
    it("should have proper ARIA labels", () => {
      const message = createMessage({
        user_id: "customer_123",
        time: "14:30",
      });
      wrapper = mount(MessageComponent, { props: { message } });

      const article = wrapper.find('[role="article"]');
      expect(article.attributes("aria-label")).toContain(
        "Mensagem de usuário às 14:30"
      );
    });

    it("should have proper semantic HTML for time", () => {
      const message = createMessage();
      wrapper = mount(MessageComponent, { props: { message } });

      const timeElement = wrapper.find("time");
      expect(timeElement.exists()).toBe(true);
      expect(timeElement.attributes("datetime")).toBeDefined();
    });

    it("should disable audio button when loading", async () => {
      const audioMessage = createMessage({
        content: "https://example.com/test.mp3",
      });
      wrapper = mount(MessageComponent, { props: { message: audioMessage } });

      wrapper.vm.isLoading = true;
      await nextTick();

      const button = wrapper.find("button");
      expect(button.attributes("disabled")).toBeDefined();
    });
  });

  describe("Edge Cases", () => {
    it("should handle missing audio ref", () => {
      const audioMessage = createMessage({
        content: "https://example.com/test.mp3",
      });
      wrapper = mount(MessageComponent, { props: { message: audioMessage } });

      wrapper.vm.audioRef = null;

      // Should not throw error
      expect(() => wrapper.vm.toggleAudio()).not.toThrow();
    });

    it("should handle audio files with query parameters", () => {
      const message = createMessage({
        content: "https://example.com/audio.mp3?v=123&token=abc",
      });
      wrapper = mount(MessageComponent, { props: { message: message } });

      expect(wrapper.find("audio").exists()).toBe(true);
    });

    it("should handle malformed URLs gracefully", () => {
      const message = createMessage({ content: "not-a-url" });
      wrapper = mount(MessageComponent, { props: { message } });

      // Should render as text message
      expect(wrapper.text()).toContain("not-a-url");
      expect(wrapper.find("audio").exists()).toBe(false);
      expect(wrapper.find('a[target="_blank"]').exists()).toBe(false);
    });
  });
});
