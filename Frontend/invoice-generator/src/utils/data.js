import { BarChart2, FileText, Mail, Sparkles, LayoutDashboard, Plus, Users } from "lucide-react";

export const FEATURES = [
  {
    icon: Sparkles,
    title: "AI Invoice Creation",
    description:
      "Paste any text, email, or receipt, and let our AI instantly generate a complete, professional invoice.",
  },
  {
    icon: BarChart2,
    title: "AI-Powered Dashboard",
    description:
      "Get smart, actionable insights about your business finances, generated automatically by AI.",
  },
  {
    icon: Mail,
    title: "Smart Reminders",
    description:
      "Automatically generate polite and effective payment reminder emails for overdue invoices.",
  },
  {
    icon: FileText,
    title: "Easy Invoice Management",
    description:
      "Easily manage all your invoices, track payments, and send reminders for overdue payments.",
  },
];

export const TESTIMONIALS = [
  {
    quote:
      "This app saved me hours of work. I can now create and send professional invoices in minutes instead of hours!",
    author: "Sarah Johnson",
    title: "Freelance Graphic Designer",
    avatar:
      "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop&crop=face",
    rating: 5,
  },
  {
    quote:
      "The best invoicing app I've ever used. Simple, intuitive, and incredibly powerful for my small business.",
    author: "Michael Chen",
    title: "Small Business Owner",
    avatar:
      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face",
    rating: 5,
  },
  {
    quote:
      "I love the dashboard and reporting features. It helps me keep track of my finances and forecast revenue effortlessly.",
    author: "Emily Rodriguez",
    title: "Marketing Consultant",
    avatar:
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face",
    rating: 5,
  },
  {
    quote:
      "As a freelance developer, this tool streamlined my entire billing process. Client payments are 50% faster now!",
    author: "Alex Thompson",
    title: "Full-Stack Developer",
    avatar:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face",
    rating: 5,
  },
  {
    quote:
      "The automated payment reminders have reduced my late payments by 80%. Game changer for my consultancy!",
    author: "Dr. Maria Garcia",
    title: "Business Consultant",
    avatar:
      "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=100&h=100&fit=crop&crop=face",
    rating: 5,
  },
  {
    quote:
      "Beautiful invoices that make my brand look established and professional. Clients always compliment them!",
    author: "James Wilson",
    title: "Photography Studio Owner",
    avatar:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=face",
    rating: 5,
  },
];

export const FAQS = [
  {
    question: "How does the AI invoice creation work?",
    answer:
      "Simply paste any text that contains invoice details-like an email, a list of items, or other information-and our AI will automatically generate a professional invoice for you.",
  },
  {
    question: "Is there a free trial available?",
    answer:
      "Yes, you can try our platform for free for 14 days. If you want, we'll provide you with a personalized demo to help you get started.",
  },
  {
    question: "Can I change my plan later?",
    answer:
      "Of course. Our pricing scales with your company. Chat to our friendly team to discuss your options.",
  },
  {
    question: "What is your cancellation policy?",
    answer:
      "We understand that things change. You can cancel your plan at any time and we'll prorate your refund.",
  },
  {
    question: "Can other info be added to an invoice?",
    answer:
      "Yes, you can add notes, payment terms, and even attach files to your invoices. Everything is customizable to fit your business needs.",
  },
  {
    question: "How does billing work?",
    answer:
      "Plans are per workspace, not per account. You can upgrade one workspace, and still have other workspaces on different plans.",
  },
  {
    question: "Is my data secure?",
    answer:
      "Absolutely. We use industry-standard encryption and security practices to ensure your data is safe and secure.",
  },
  {
    question: "How do I change my account email?",
    answer:
      "You can change your account email in the account settings. If you need assistance, our support team is here to help.",
  },
];

export const NAVIGATION_MENU = [
  { id: "dashboard", name: "Dashboard", icon: LayoutDashboard },
  { id: "invoices", name: "Invoices", icon: FileText },
  { id: "invoices/new", name: "Create Invoice", icon: Plus },
  { id: "profile", name: "Profile", icon: Users },
];
