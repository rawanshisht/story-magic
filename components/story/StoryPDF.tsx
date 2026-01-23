import {
  Document,
  Page,
  Text,
  View,
  Image,
  StyleSheet,
} from "@react-pdf/renderer";
import { StoryPage } from "@/types";

const styles = StyleSheet.create({
  page: {
    flexDirection: "column",
    backgroundColor: "#FFFFFF",
    padding: 40,
  },
  coverPage: {
    flexDirection: "column",
    backgroundColor: "#8B5CF6",
    padding: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  coverTitle: {
    fontSize: 36,
    fontWeight: "bold",
    color: "#FFFFFF",
    textAlign: "center",
    marginBottom: 20,
  },
  coverSubtitle: {
    fontSize: 18,
    color: "#E9D5FF",
    textAlign: "center",
  },
  storyPage: {
    flex: 1,
    justifyContent: "space-between",
  },
  imageContainer: {
    width: "100%",
    height: 350,
    marginBottom: 20,
    borderRadius: 8,
    overflow: "hidden",
  },
  image: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
  },
  placeholderImage: {
    width: "100%",
    height: "100%",
    backgroundColor: "#F3F4F6",
    justifyContent: "center",
    alignItems: "center",
  },
  placeholderText: {
    color: "#9CA3AF",
    fontSize: 14,
  },
  textContainer: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  storyText: {
    fontSize: 16,
    lineHeight: 1.8,
    textAlign: "center",
    color: "#1F2937",
  },
  pageNumber: {
    position: "absolute",
    bottom: 20,
    left: 0,
    right: 0,
    textAlign: "center",
    fontSize: 12,
    color: "#9CA3AF",
  },
  footer: {
    marginTop: "auto",
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
  },
  footerText: {
    fontSize: 10,
    color: "#9CA3AF",
    textAlign: "center",
  },
});

interface StoryPDFProps {
  title: string;
  childName: string;
  moral: string;
  pages: StoryPage[];
}

export function StoryPDF({ title, childName, moral, pages }: StoryPDFProps) {
  return (
    <Document>
      {/* Cover Page */}
      <Page size="A4" style={styles.coverPage}>
        <Text style={styles.coverTitle}>{title}</Text>
        <Text style={styles.coverSubtitle}>
          A story about {moral} featuring {childName}
        </Text>
        <View style={{ marginTop: 40 }}>
          <Text style={{ color: "#E9D5FF", fontSize: 14 }}>
            Created with StoryBook
          </Text>
        </View>
      </Page>

      {/* Story Pages */}
      {pages.map((page) => (
        <Page key={page.pageNumber} size="A4" style={styles.page}>
          <View style={styles.storyPage}>
            <View style={styles.imageContainer}>
              {/* Use base64 image if available (for PDF), otherwise fall back to URL */}
              {page.imageBase64 ? (
                <Image style={styles.image} src={page.imageBase64} />
              ) : page.imageUrl &&
                page.imageUrl !== "/placeholder-illustration.svg" ? (
                <Image style={styles.image} src={page.imageUrl} />
              ) : (
                <View style={styles.placeholderImage}>
                  <Text style={styles.placeholderText}>
                    Page {page.pageNumber}
                  </Text>
                </View>
              )}
            </View>
            <View style={styles.textContainer}>
              <Text style={styles.storyText}>{page.text}</Text>
            </View>
          </View>
          <Text style={styles.pageNumber}>Page {page.pageNumber}</Text>
        </Page>
      ))}

      {/* End Page */}
      <Page size="A4" style={styles.coverPage}>
        <Text style={styles.coverTitle}>The End</Text>
        <View style={{ marginTop: 20 }}>
          <Text style={{ color: "#E9D5FF", fontSize: 16, textAlign: "center" }}>
            Thank you for reading!
          </Text>
        </View>
        <View style={styles.footer}>
          <Text style={{ color: "#E9D5FF", fontSize: 10, textAlign: "center" }}>
            This story was created with love by StoryBook
          </Text>
        </View>
      </Page>
    </Document>
  );
}
