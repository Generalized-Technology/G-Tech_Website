export interface Domain {
  id: string;
  name: string;
  description: string;
  icon: string;
}

export interface Lead {
  id: string;
  name: string;
  role: string;
  image: string;
  domain: string;
  contact?: string;
  links?: {
    linkedin?: string;
    portfolio?: string;
    instagram?: string;
  };
}

export interface LeadArchive {
  year: string;
  leads: Lead[];
}

export interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  driveLink: string;
  image?: string;
}

export interface Video {
  id: string;
  title: string;
  url: string;
}

export interface GalleryImage {
  id: string;
  url: string;
  caption: string;
}

export interface Tool {
  id: string;
  name: string;
  description: string;
  icon: string;
  link: string;
  category: string;
}

export const domains: Domain[] = [
  {
    id: "photography",
    name: "Photography",
    description:
      "Capturing club moments and visual stories with precision and creativity.",
    icon: "Camera",
  },
  {
    id: "videography",
    name: "Videography",
    description: "Filming events and motion content to bring stories to life.",
    icon: "Video",
  },
  {
    id: "video-editing",
    name: "Video Editing",
    description: "Cutting, refining, and producing polished videos.",
    icon: "Film",
  },
  {
    id: "graphic-design",
    name: "Graphic Design",
    description:
      "Creating posters, branding, and visual identity that stands out.",
    icon: "Palette",
  },
  {
    id: "web-dev",
    name: "Web Development",
    description:
      "Building digital experiences and club sites with modern technologies.",
    icon: "Code",
  },
  {
    id: "documentation",
    name: "Documentation",
    description:
      "Reports, records, and structured content management for club.",
    icon: "FileText",
  },
];

export const leads: Lead[] = [
  {
    id: "a1",
    name: "Monishwar",
    role: "Lead",
    domain: "Over-all Club",
    image: "/images/leads/2526/monish.webp",
  },
  {
    id: "a2",
    name: "Devanand",
    role: "Co-Lead",
    domain: "Over-all Club",
    image: "/images/leads/2526/deva.webp",
  },
  {
    id: "3",
    name: "Jordan Smith",
    role: "Creative Head",
    domain: "Graphic Design",
    image: "https://picsum.photos/seed/lead3/400/400",
    links: {
      instagram: "#",
    },
  },
  {
    id: "4",
    name: "Elena Gilbert",
    role: "Media Lead",
    domain: "Photography",
    image: "https://picsum.photos/seed/lead4/400/400",
  },
];

export const leadArchive: LeadArchive[] = [
  {
    year: "2025–26",
    leads: leads,
  },
  {
    year: "2024–25",
    leads: [
      {
        id: "a1",
        name: "Monishwar",
        role: "Lead",
        domain: "Over-all Club",
        image: "/images/leads/2526/monish.webp",
      },
      {
        id: "a2",
        name: "Devanand",
        role: "Co-Lead",
        domain: "Over-all Club",
        image: "https://picsum.photos/seed/past2/400/400",
      },
    ],
  },
  {
    year: "2023–24",
    leads: [
      {
        id: "b1",
        name: "David Miller",
        role: "President",
        domain: "Management",
        image: "https://picsum.photos/seed/past3/400/400",
      },
    ],
  },
];

export const events: Event[] = [
  {
    id: "1",
    title: "Tech-X 2024",
    description:
      "The biggest annual technical symposium featuring workshops, hackathons, and guest lectures.",
    date: "March 15, 2024",
    driveLink: "#",
    image: "https://picsum.photos/seed/event1/800/450",
  },
  {
    id: "2",
    title: "Code-A-Thon",
    description:
      "A 24-hour intense coding competition to solve real-world problems using technology.",
    date: "January 20, 2024",
    driveLink: "#",
    image: "https://picsum.photos/seed/event2/800/450",
  },
  {
    id: "3",
    title: "Design Workshop",
    description:
      "A hands-on session on UI/UX principles and modern graphic design tools.",
    date: "December 10, 2023",
    driveLink: "#",
    image: "https://picsum.photos/seed/event3/800/450",
  },
  {
    id: "4",
    title: "Design Workshop",
    description:
      "A hands-on session on UI/UX principles and modern graphic design tools.",
    date: "December 10, 2023",
    driveLink: "#",
    image: "https://picsum.photos/seed/event3/800/450",
  },
];

export const videos: Video[] = [
  {
    id: "1",
    title: "Tech-X Highlights",
    url: "/video/placeholder.mp4",
  },
  {
    id: "2",
    title: "Club Orientation 2024",
    url: "/video/placeholder2.mp4",
  },
  {
    id: "3",
    title: "Workshop Teaser",
    url: "/video/placeholder.mp4",
  },
  {
    id: "4",
    title: "Member Showcase",
    url: "/video/placeholder2.mp4",
  },
  {
    id: "5",
    title: "Behind the Scenes",
    url: "/video/placeholder.mp4",
  },
];

export const galleryImages: GalleryImage[] = [
  {
    id: "1",
    url: "https://picsum.photos/seed/gal1/800/600",
    caption: "Team Meeting",
  },
  {
    id: "2",
    url: "https://picsum.photos/seed/gal2/600/800",
    caption: "Event Setup",
  },
  {
    id: "3",
    url: "https://picsum.photos/seed/gal3/800/800",
    caption: "Workshop Session",
  },
  {
    id: "4",
    url: "https://picsum.photos/seed/gal4/800/600",
    caption: "Hackathon Night",
  },
  {
    id: "5",
    url: "https://picsum.photos/seed/gal5/600/600",
    caption: "Award Ceremony",
  },
  {
    id: "6",
    url: "https://picsum.photos/seed/gal6/800/600",
    caption: "Group Photo",
  },
];

export const tools: Tool[] = [
  {
    id: "asset-portal",
    name: "Asset Portal",
    description: "Centrally managed library of high-resolution club assets, logos, and brand guidelines.",
    icon: "FolderOpen",
    link: "#",
    category: "Resources"
  },
  {
    id: "event-manager",
    name: "Event Manager",
    description: "Internal dashboard for planning, tracking, and executing technical events and workshops.",
    icon: "Layout",
    link: "#",
    category: "Internal"
  },
  {
    id: "gtech-cli",
    name: "G-Tech CLI",
    description: "command-line interface for automating club-specific workflows and student projects.",
    icon: "Terminal",
    link: "#",
    category: "Software"
  },
  {
    id: "cert-gen",
    name: "Cert-Gen",
    description: "automated system for generating and distributing verifiable event participation certificates.",
    icon: "Award",
    link: "#",
    category: "Utility"
  }
];

